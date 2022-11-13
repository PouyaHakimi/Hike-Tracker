const joi = require("joi");
const { StatusCodes } = require("http-status-codes");
const hikeDAL = require("../data/hike-dal");
const hikeService = require("../services/hike-service");
const { Difficulty, LocationType } = require("../models/enums");

/**
 * GET /hike
 * Get all hikes.
 * @param {*} req
 * @param {*} res
 */
async function getHikes(req, res) {
	try {
		const { query } = req;

		console.log(query);

		const schema = joi.object().keys({
			minLength: joi.number(),
			maxLength: joi.number(),
			minAscent: joi.number(),
			maxAscent: joi.number(),
			minExpectedTime: joi.number(),
			maxExpectedTime: joi.number(),
			difficulty: joi.string().valid(...Object.values(Difficulty)),
			// Location validation
			location: joi.object().keys({
				coordinates: joi
					.array()
					.items(joi.number())
					.length(2)
					.required()
					.description("Coordinates in the format [<longitude>, <latitude>]"),
				radius: joi.number().required().description("Max distance in kilometers"),
			}),
		});

		const { error, value } = schema.validate(query);

		if (error) throw error;

		let filter = {};

		// This can be moved inside the database layer (DAL)
		if (value.minLength) filter.length = { ...filter.length, $gt: value.minLength };
		if (value.maxLength) filter.length = { ...filter.length, $lt: value.maxLength };
		if (value.minAscent) filter.ascent = { ...filter.ascent, $gt: value.minAscent };
		if (value.maxAscent) filter.ascent = { ...filter.ascent, $lt: value.maxAscent };
		if (value.minExpectedTime)
			filter.expectedTime = { ...filter.expectedTime, $gt: value.minExpectedTime };
		if (value.maxExpectedTime)
			filter.expectedTime = { ...filter.expectedTime, $lt: value.maxExpectedTime };
		if (value.difficulty) filter.difficulty = value.difficulty;
		if (value.location) filter.startingPoint = value.location;

		const hikes = await hikeDAL.getHikes(filter);
		return res.status(StatusCodes.OK).json(hikes);
	} catch (err) {
		return res.status(StatusCodes.BAD_REQUEST).json({ err: err.message });
	}
}

async function createHike(req, res) {
	try {
		// Validate request body
		const { body } = req;

		// Location validation schema
		const locationSchema = joi.object().keys({
			locationType: joi
				.string()
				.valid(...Object.values(LocationType))
				.required(),
			description: joi.string().required(),
			point: joi.array().items(joi.number()).length(2).required(),
		});

		// Hike validation schema
		const schema = joi.object().keys({
			title: joi.string().required(),
			length: joi.number().required(),
			ascent: joi.number().required(),
			expectedTime: joi.number().required(),
			difficulty: joi
				.string()
				.required()
				.valid(...Object.values(Difficulty)),
			description: joi.string().required(),
			startPoint: locationSchema.required(),
			endPoint: locationSchema.required(),
			referencePoints: joi.array().items(locationSchema),
			// How to validate on database?
		});

		// Validate request body against schema
		const { error, value } = schema.validate(body);

		if (error) throw error; // Joi validation error, goes to catch block

		// Create new hike
		const createdHike = await hikeService.createHike(value);
		return res.status(StatusCodes.CREATED).json(createdHike);
	} catch (err) {
		return res.status(StatusCodes.BAD_REQUEST).json({ err: err.message, stack: err.stack });
	}
}

module.exports = {
	getHikes,
	createHike,
};
