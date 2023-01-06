
const { ENDPOINTS, BACKEND_URL } = require("./config");





async function updateWeatherAlert(Mapchanges) {
	
	//console.log(weather);
	console.log(Mapchanges);
	const pouya = 1
	
	try {
		const response = await fetch(
			new URL(ENDPOINTS.weatherAlert.update, BACKEND_URL),
			{
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(Mapchanges),
			}
		);
		return await response.json();
	} catch (err) {
		console.error(err);
	}
}

module.exports={
    updateWeatherAlert
}