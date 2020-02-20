const axios = require('axios').default;

const admin = {
	/**
	 * Makes a GET request
	 * @param  {string} path API Endpoint path
	 * @returns {Promise<{data: Object}>}
	 */
	getRequest: (path) => {
		const host = process.env.ADMIN_HOST;
		const key = process.env.ADMIN_KEY;
		const headers = {
			Authorization: 'Bearer ' + key,
			'Content-Type': 'application/json',
			Accept: 'Application/vnd.pterodactyl.v1+json'
		};
		return new Promise((resolve, reject) => {
			axios
				.get(host + path, { headers })
				.then((response) => {
					if (response.status === 404) {
						reject('404 Not found, check your host is correct');
					} else if (response.status === 403) {
						reject(
							'403 Forbidden, please check your API key is correct, or that you setup permissions correctly'
						);
					} else if (response.status === 500) {
						reject('500 Internal Server Error, check your server logs for the error');
					} else {
						resolve({ data: response.data });
					}
				})
				.catch((error) => {
					reject(error.message);
				});
		});
	},
	deleteRequest: (path) => {
		const host = process.env.ADMIN_HOST;
		const key = process.env.ADMIN_KEY;
		const headers = {
			Authorization: 'Bearer ' + key,
			'Content-Type': 'application/json',
			Accept: 'Application/vnd.pterodactyl.v1+json'
		};
		return new Promise((resolve, reject) => {
			axios
				.delete(host + path, { headers })
				.then((response) => {
					if (response.status === 404) {
						reject('404 Not found, check your host is correct');
					} else if (response.status === 403) {
						reject(
							'403 Forbidden, please check your API key is correct, or that you setup permissions correctly'
						);
					} else if (response.status === 500) {
						reject('500 Internal Server Error, check your server logs for the error');
					} else {
						resolve({ data: response.data });
					}
				})
				.catch((error) => {
					reject(error.message);
				});
		});
	},
	/**
	 * Makes a PATCH request
	 * @param {string} path API Endpoint path
	 * @returns {Promise<{data: Object}>}
	 */
	patchRequest: (path, data) => {
		const host = process.env.ADMIN_HOST;
		const key = process.env.ADMIN_KEY;
		const headers = {
			Authorization: 'Bearer ' + key,
			'Content-Type': 'application/json',
			Accept: 'Application/vnd.pterodactyl.v1+json'
		};
		return new Promise((resolve, reject) => {
			axios
				.patch(host + path, data, { headers })
				.then((response) => {
					if (response.status === 404) {
						reject('404 Not found, check your host is correct');
					} else if (response.status === 403) {
						reject(
							'403 Forbidden, please check your API key is correct, or that you setup permissions correctly'
						);
					} else if (response.status === 500) {
						reject('500 Internal Server Error, check your server logs for the error');
					} else {
						resolve({ data: response.data });
					}
				})
				.catch((error) => {
					reject(error.message);
				});
		});
	},
	/**
	* Makes a POST request
	* @param  {string} path API Endpoint path
	* @param {Object} data Data to POST
	* @returns {Promise<{data: Object}>}
	*/
	postRequest: (path, data = {}) => {
		const host = process.env.ADMIN_HOST;
		const key = process.env.ADMIN_KEY;
		const headers = {
			Authorization: 'Bearer ' + key,
			'Content-Type': 'application/json',
			Accept: 'Application/vnd.pterodactyl.v1+json'
		};
		return new Promise((resolve, reject) => {
			axios
				.post(host + path, data, { headers, followRedirect: true, maxRedirects: 3 })
				.then((response) => {
					if (response.status === 404) {
						reject('404 Not found, check your host is correct');
					} else if (response.status === 403) {
						reject(
							'403 Forbidden, please check your API key is correct, or that you setup permissions correctly'
						);
					} else if (response.status === 500) {
						reject('500 Internal Server Error, check your server logs for the error');
					} else {
						resolve({ data: response.data });
					}
				})
				.catch((error) => {
					reject(error.message);
				});
		});
	}
};
const user = {};

module.exports = { user, admin };
