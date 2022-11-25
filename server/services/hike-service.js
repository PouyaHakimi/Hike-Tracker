const locationDAL = require("../data/location-dal");
const hikeDAL = require("../data/hike-dal");
const { LocationType } = require("../models/enums");

/**
 * Creates a new hike and new locations for the start point, end point and reference points.
 * @param {*} hike Hike to be created
 * @param {*} referencePoints Reference points related to the hike, that will be created as entities in the database (Hut, Parking, etc.)
 * @returns
 */
async function createHike(hike) {
	// Create new locations for the start point and end point if they don't exist
	if (!hike.startPoint._id) {
		const startPoint = await locationDAL.createLocation({
			locationType: LocationType.DEFAULT,
			description: `Starting point of '${hike.title}'`,
			point: [hike.startPoint.point.lng, hike.startPoint.point.lat],
		});
		hike.startPointId = startPoint._id;
	}
	if (!hike.endPoint._id) {
		const endPoint = await locationDAL.createLocation({
			locationType: LocationType.DEFAULT,
			description: `End point of '${hike.title}'`,
			point: [hike.endPoint.point.lng, hike.endPoint.point.lat],
		});
		hike.endPointId = endPoint._id;
	}

	// Create new locations for the reference points if they don't exist
	const referencePoints = await Promise.all(
		hike.referencePoints.map(async (referencePoint) => {
			if (!referencePoint._id) {
				return await locationDAL.createLocation({
					locationType: referencePoint.locationType,
					description: referencePoint.description,
					point: [referencePoint.point.lng, referencePoint.point.lat],
				});
			} else {
				return referencePoint;
			}
		})
	);

	// Create new hike
	const newHike = hikeDAL.createHike({
		title: hike.title,
		length: hike.length,
		ascent: hike.ascent,
		expectedTime: hike.expectedTime,
		difficulty: hike.difficulty,
		description: hike.description,
		startPoint: hike.startPoint._id || hike.startPointId,
		endPoint: hike.endPoint._id || hike.endPointId,
		referencePoints: referencePoints.map((referencePoint) => referencePoint._id),
		trackPoints: hike.trackPoints,
		createdBy: hike.createdBy
	});

	return newHike;
}

async function checkPropertyLocation(point) {

	if (point instanceof String) {
		const pt = await Location.findById(point);
		return pt
	} else {
		if (point) {
			const pt = await locationDAL.createLocation({
				locationType: point.locationType,
				description: point.description,
				point: [point.point.lng, point.point.lat],	
			});
			return pt
		}
	}

}

async function updateHike(id, changes, hikeToUpdate) {

	changes.startPoint ? changes.startPoint = await checkPropertyLocation(changes.startPoint) : null;
	changes.endPoint ? changes.endPoint = await checkPropertyLocation(changes.endPoint) : null;
	console.log(changes)
	console.log(hikeToUpdate.referencePoints)
	let referencePoints = [];
	if (changes.referencePoints) {
		referencePoints = await Promise.all(
			changes.referencePoints.map(async (referencePoint) => {
				if (!referencePoint._id) {
					return await locationDAL.createLocation({
						locationType: referencePoint.locationType,
						description: referencePoint.description,
						point: [referencePoint.point.lng, referencePoint.point.lat],
					});
				} else {
					return referencePoint;
				}
			})
		);
		
	}

	hikeToUpdate.referencePoints.forEach(x => {
		referencePoints.push(x)
	})

	changes.referencePoints = referencePoints

	const updatedHike = await hikeDAL.updateHike(id, changes);

	return updatedHike

}

async function getHikeById(id) {

	const hike = await hikeDAL.getHikeById(id)
	return hike
}




module.exports = { createHike, updateHike, getHikeById };
