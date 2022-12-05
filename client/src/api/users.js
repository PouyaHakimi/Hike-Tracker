const { BACKEND_URL, ENDPOINTS } = require("./config");
const { addQueryParams } = require("./config");

async function getUsers(filters = {}) {
    try {
		const url = new URL(ENDPOINTS.users.all, BACKEND_URL);

		addQueryParams(url, filters);

		const response = await fetch(url, {
			credentials: "include",
		});
		if (response.ok)
			return await response.json();
		throw await response.json();
	} catch (err) {
		return { error: err };
	}
}

async function createUser({ email, fullName, userType, password, confirmPassword }) {
    const response = await fetch(new URL(ENDPOINTS.users.insert, BACKEND_URL), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ email, fullName, userType, password, confirmPassword })
    });
    if (!response.ok) {
        const errDetails = await response.json();
        throw errDetails;
    }
}

async function verifyUser(uniqueString) {
    const response = await fetch(new URL(ENDPOINTS.users.verify.replace(":uniqueString", uniqueString), BACKEND_URL), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.ok || response.status === 404) {
        const message = await response.json();
        return message;
    }
    else {
        const errDetails = await response.text();
        throw errDetails;
    }
}

async function updateUser(id, changes) {
    try {
		const response = await fetch(new URL(ENDPOINTS.users.update.replace(":id", id), BACKEND_URL), {
			method: "PATCH",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(changes),
		});
        if (!response.ok)
            throw await response.json();
	} catch (err) {
		console.error(err);
	}
}

module.exports = {
    getUsers,
    createUser,
    verifyUser,
    updateUser
};
