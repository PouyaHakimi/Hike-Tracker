const BACKEND_URL = "http://localhost:8080/api/";

const ENDPOINTS = {
	hikes: {
		all: "hike",
		byId: "hike/:id",
		insert: "hike",
		update: "hike/:id"
	},
	locations: {
		all: "location",
		byId: "location/:id",
		insert: "location",
		update: "location/:id"
	},
	sessions: {
		insert: "session",
		current: "session/current",
	},
	users: {
		all: "user",
		insert: "user",
		update: "user/:id",
		verify: "user/verify/:uniqueString",
	},
};

/**
 * Adds the query parameters to the url
 * @param {URL} url 
 * @param {Object} query 
 */
function addQueryParams(url, query) {
	for (const [key, value] of Object.entries(query)) {
		url.searchParams.append(key, value.toString());
	}
}

module.exports = { ENDPOINTS, BACKEND_URL, addQueryParams };
