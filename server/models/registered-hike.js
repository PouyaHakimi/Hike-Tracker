const mongoose = require("mongoose");
const { Schema } = mongoose;
const { HikeStatus } = require("./enums");

// Registered Hike Schema
const registeredHikeSchema = new Schema(
	{
		hike: { type: Schema.Types.ObjectId, ref: "Hike", required: true },
		status: { type: String, enum: Object.values(HikeStatus) },
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		buddyUsers: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
		recordedPoints: [[Number]], // Must be a reference point of the hike (validation server side should checks this)
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: false }, // If the hike is not completed, this field is null
	},
	{ timestamps: true }
);

// Registered Hike Model
const RegisteredHike = mongoose.model("RegisteredHike", registeredHikeSchema);

module.exports = RegisteredHike;
