const axios = require('axios');

/**
 * Removes trailing slash from URL
 * @param  {string} host Base URI of the pterodactyl panel
 * @returns {string} Host without trailing slash
 */
const cleanHost = (host) => {
	return host.replace(/\/$/, '');
};
/**
 * Check and sets the API key
 * @param  {string} host Base URI of the pterodactyl panel
 * @param  {string} key Admin API key for the pterodactyl panel
 * @returns {Promise<{status: boolean, message: string}>} 
 */
const setApiKey = (host, key) => {
	process.env.ADMIN_HOST = cleanHost(host);
	process.env.ADMIN_KEY = key;
	return new Promise((resolve) => {
		axios
			.get(`${host}/api/application/users`, {
				maxRedirects: 5,
				headers: {
					Authorization: `Bearer ${key}`,
					'Content-Type': 'application/json',
					Accept: 'Application/vnd.pterodactyl.v1+json'
				},
				responseEncoding: 'utf8'
			})
			.then((res) => {
				if (res === 404) {
					resolve({
						loggedIn: false,
						message: '404 Not found, please check you have provided a valid host.'
					});
				} else {
					resolve({ loggedIn: true, message: 'Successfully authenticated' });
				}
			})
			.catch((err) => {
				if (err.status == 403) {
					resolve({ loggedIn: false, message: '403 Forbidden, please check your API key is valid' });
				} else {
					resolve({ loggedIn: false, message: err.message });
				}
			});
	});
};

const servers = require('./methods/servers/index');

module.exports = {
	setApiKey,
	...servers
};
