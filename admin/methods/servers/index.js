const { admin } = require('../../../request');

const filterObject = (obj, predicate) =>
	Object.keys(obj).filter((key) => predicate(obj[key])).reduce((res, key) => ((res[key] = obj[key]), res), {});

/**
 * @typedef {Object} Limits
 * @property {number} memory Allocated memory
 * @property {number} swap Allocated swap
 * @property {number} disk Disk space
 * @property {number} io Block IO weight
 * @property {number} cpu CPU limit
 */
/**
 * @typedef {Object} FeatureLimits
 * @property {number} database
 * @property {number} allocations
 */
/**
 * @typedef {Object} Container
 * @property {string} startup_command
 * @property {string} image Docker image
 * @property {boolean} installed
 * @property {Object} environment
 */
/**
 * @typedef {Object} Database
 * @property {number} id - Database ID
 * @property {number} server - Server ID
 * @property {number} host - Host server ID
 * @property {string} database - Database name
 * @property {string} username - Database username
 * @property {string} remote - Database remote connection rule
 * @property {string} created_at - Timestamp when the database was created
 * @property {string} updated_at - Timestamp when the database was last updated
 */
/**
 * @typedef {Object} Server
 * @property {number} id
 * @property {?string}
 * @property {string} uuid
 * @property {string} identifier
 * @property {string} name
 * @property {string} description
 * @property {boolean} suspended
 * @property {Limits} limits
 * @property {FeatureLimits} feature_limits
 * @property {number} user Owner ID of the server
 * @property {number} node Node ID of the server
 * @property {number} allocation Allocation ID of the server
 * @property {number} nest Nest ID of the server
 * @property {number} egg Egg ID of the server
 * @property {?number} pack Pack ID of the server
 * @property {Container} container
 * @property {string} updated_at
 * @property {string} created_at
 */
/**
 * @typedef {Object} Pagination
 * @property {number} total
 * @property {number} count
 * @property {number} per_page
 * @property {number} current_page
 * @property {number} total_pages
 * @property {Object[]} links
 */
/**
 * @typedef {Object} Deploy
 * @property {number[]} locations
 * @property {boolean} dedicated_ip
 * @property {number[]} port_range
 */

/**
 * Gets a list of all servers on the site
 * @returns {Promise<{servers: Server[], pagination: Pagination}>}
 */
const getAllServers = () => {
	return new Promise((resolve, reject) => {
		admin
			.getRequest('/api/application/servers')
			.then((response) => {
				resolve({
					servers: response.data.data.map((data) => data.attributes),
					pagination: response.data.meta.pagination
				});
			})
			.catch((error) => {
				reject(error);
			});
	});
};
/**
 * 
 * @param {number|string} id - Internal or external ID
 * @param {boolean} [external=true] - Get by external ID?
 * @returns {Promise<Server>}
 */
const getServerInformation = (id, external = false) => {
	return new Promise((resolve, reject) => {
		admin
			.getRequest('/api/application/servers/' + external ? 'external/' + id : id)
			.then((response) => {
				resolve(response.data.attributes);
			})
			.catch((error) => {
				reject(error);
			});
	});
};
/**
 * 
 * @param {number} internal_id - Internal ID of the server
 * @returns {Promise<Database[]>}
 */
const getAllDatabases = (internal_id) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		admin
			.getRequest('/api/application/servers/' + internal_id + '/databases')
			.then((response) => {
				resolve({ databases: response.data.data.map((database) => database.attributes) });
			})
			.catch((error) => {
				reject(error);
			});
	});
};
/**
 * 
 * @param {number} internal_id - Internal ID of the server
 * @param {number} database_id - Database ID
 * @returns {Promise<Database>}
 */
const getDatabase = (internal_id, database_id) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		if (isNaN(database_id)) {
			reject('Database ID must be a number');
		}
		admin
			.getRequest('/api/application/servers/' + internal_id + '/databases/' + database_id)
			.then((response) => {
				resolve(response.data.attributes);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

/* POST */
/**
 * 
 * @param {number} internal_id - Internal ID of the server
 * @param {string} database - Database name
 * @param {number} host - Database host ID
 * @param {string} remote - Database remote connection rule
 * @returns {Promise<Database>}
 */
const createDatabase = (internal_id, database, host, remote) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		if (!database || typeof database !== 'string') {
			reject('Database name must be a string');
		}
		if (!host || typeof host !== 'number') {
			reject('Database host must be a integer');
		}
		if (!remote || typeof remote !== 'string') {
			reject('Database remote connection rule must be a string');
		}
		admin
			.postRequest('/api/application/servers/' + internal_id + '/databases', { database, remote, host })
			.then((response) => {
				resolve(response.data.attributes);
			})
			.catch((error) => {
				if (error.includes('403')) {
					reject(
						'Request failed with status code 403\nPossible reasons: invalid API key, reached limit of databases for that server, not your server'
					);
				} else {
					reject(error);
				}
			});
	});
};

/**
 * 
 * @param {string} name - Name of the server
 * @param {string} description - Description of the server
 * @param {number} userID - The ID of the user that will own the server
 * @param {number} eggID
 * @param {string} startup - Command that runs when the server is started 
 * @param {string} dockerImage - The docker image (e.g "quay.io/pterodactyl/core:source")
 * @param {number} allocationID - The allocation ID
 * @param {boolean} startOnComplete - Start the server when installed?
 * @param {Object} environmentf - Object of environment variables (e.g SRCDS_APPID)
 * @param {number} memory - Memory limit
 * @param {number} disk - Disk limit
 * @param {number} [cpu=0] - CPU limit
 * @param {number} [swap=-1] - Swap limit
 * @param {number} [io=500] - IO limit - I'd strongly suggest you keep this to 500, as advised by pterodactyl
 * @param {number[]} [additionalAllocations=[]] - Array of allocation IDs
 * @param {number} [databases=0] - Servers database limit
 * @param {number} [allocations=0] - Servers allocation limit
 * @param {Deploy} [deploy={locations:[1],dedicated_ip:false,port_range:[]}] - Servers deployment information
 * @param {boolean} [skipScripts=false] - Whether or not to skip egg scripts
 * @param {boolean} [oomDisabled=true] - Whether the server should have OOM Killer disabled or not
 * @returns {Promise<{server: Server}>}
 */
const createServer = (
	name,
	description,
	userID,
	eggID,
	startup,
	dockerImage,
	allocationID,
	startOnComplete,
	environment,
	memory,
	disk,
	cpu = 0,
	swap = -1,
	io = 500,
	additionalAllocations = [],
	databases = 0,
	allocations = 0,
	deploy = { locations: [ 1 ], dedicated_ip: false, port_range: [] },
	skipScripts = false,
	oomDisabled = true
) => {
	return new Promise((resolve, reject) => {
		if (typeof name !== 'string') {
			reject('Error: Server name must be a string');
		}
		if (typeof userID !== 'number') {
			reject('Error: User ID must be a number');
		}
		if (typeof eggID !== 'number') {
			reject('Error: Egg ID must be a number');
		}
		if (typeof startup !== 'string') {
			reject('Error: Startup command must be a string');
		}
		if (typeof memory !== 'number') {
			reject('Error: Memory allocated must be a number');
		}
		if (typeof disk !== 'number') {
			reject('Error: Disk space must be a number');
		}
		if (typeof dockerImage !== 'string') {
			reject('Error: Docker image must be a string');
		}
		if (typeof allocationID !== 'number') {
			reject('Error: Allocation ID must be a number');
		}
		if (typeof startOnComplete !== 'boolean') {
			reject('Error: Start on complete setting must be a boolean');
		}
		if (!Array.isArray(additionalAllocations)) {
			reject('Error: Additional allocations must be an array');
		}
		if (typeof cpu !== 'number') {
			reject('Error: CPU limit must be a number');
		}
		if (typeof swap !== 'number') {
			reject('Error: Swap space must be a number');
		}
		if (typeof io !== 'number') {
			reject('Error: Block IO proportion must be a number');
		} else {
			if (io !== 500) {
				console.log('Block IO proportion is not set to 500, I sure hope you know what you are doing');
			}
		}
		if (typeof environment !== 'object') {
			reject('Error: Environment variables must be in an Object');
		}
		if (typeof databases !== 'number') {
			reject('Error: Database allocations must be a number');
		}
		// if (typeof allocations !== 'number') {
		// 		//This feature is not implemented yet
		// }
		if (typeof deploy !== 'object') {
			reject('Error: Deployment settings must be in an Object');
		}
		if (typeof skipScripts !== 'boolean') {
			reject('Error: Skip scripts setting must be a boolean');
		}
		if (typeof oomDisabled !== 'boolean') {
			reject('Error: OOM Killer setting must be a boolean');
		}

		const data = {
			name,
			description,
			startup,
			environment,
			deploy,
			start_on_completion: startOnComplete,
			user: userID,
			egg: eggID,
			limits: {
				memory,
				swap,
				disk,
				io,
				cpu
			},
			feature_limits: {
				databases,
				allocations
			},
			docker_image: dockerImage,
			allocation: {
				default: allocationID,
				additional: additionalAllocations
			},
			skip_scripts: skipScripts,
			oom_disabled: oomDisabled
		};

		admin
			.postRequest('/api/application/servers', data)
			.then((response) => {
				resolve({ server: response.data.attributes });
			})
			.catch((error) => {
				reject(error);
			});
	});
};
/**
 * 
 * @param {number} internal_id - Internal ID of the server
 * @returns {Promise<{message: string}>}
 */
const suspendServer = (internal_id) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		admin
			.postRequest('/api/application/servers/' + internal_id + '/suspend')
			.then(() => {
				resolve('Successfully suspended the server');
			})
			.catch((err) => {
				reject(err);
			});
	});
};
/**
 * 
 * @param {number} internal_id - Internal ID of the server
 * @returns {Promise<{message: string}>}
 */
const unsuspendServer = (internal_id) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		admin
			.postRequest('/api/application/servers/' + internal_id + '/unsuspend')
			.then(() => {
				resolve('Successfully unsuspended the server');
			})
			.catch((err) => {
				reject(err);
			});
	});
};
/**
 * 
 * @param {number} internal_id - Internal ID of the server
 * @returns {Promise<{message: string}>}
 */
const reinstallServer = (internal_id) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		admin
			.postRequest('/api/application/servers/' + internal_id + '/reinstall')
			.then(() => {
				resolve('Successfully started to reinstall the server');
			})
			.catch((err) => {
				reject(err);
			});
	});
};
/**
 * 
 * @param {number} internal_id - Internal ID of the server
 * @returns {Promise<{message: string}>}
 */
const rebuildServer = (internal_id) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		admin
			.postRequest('/api/application/servers/' + internal_id + '/rebuild')
			.then(() => {
				resolve('Successfully started to rebuild the server');
			})
			.catch((err) => {
				reject(err);
			});
	});
};
/**
 * 
 * @param {number} internal_id - Internal ID of the server
 * @returns {Promise<{message: string}>}
 */
const deleteServer = (internal_id) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		admin
			.deleteRequest('/api/application/servers/' + internal_id)
			.then(() => {
				resolve('Successfully deleted the server');
			})
			.catch((err) => {
				reject(err);
			});
	});
};
/**
 * @param {number} internal_id - Internal ID of the server you want to update
 * @param {string} name - New name for the server
 * @param {number} user - New owner of the server
 * @param {?string} external_id - New external ID
 * @param {?string} description - New description
 * @returns {Promise<{server: Server}>}
 */
const updateServerDetails = (internal_id, name, user, external_id, description) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		if (!name || typeof name !== 'string') {
			reject('You must supply a valid name');
		}
		if (!user || typeof user !== 'number') {
			reject('You must supply a valid user ID');
		}
		const obj = { name, user };
		if (external_id) {
			obj.external_id = external_id;
		}
		if (description && typeof description === 'string') {
			obj.description = description;
		}

		admin
			.patchRequest('/api/application/servers/' + internal_id + '/details', obj)
			.then((response) => {
				resolve({ server: response.data.attributes });
			})
			.catch((error) => {
				reject(error);
			});
	});
};
/**
 * 
 * @param {number} internal_id - Internal ID of the server you want to update
 * @param {number} allocation_id - The server's default allocation id
 * @param {?number} database_limit - The server's database limit
 * @param {?number} allocation_limit - The servers allocation limit
 * @param {?number} memory - The server's memory limit
 * @param {?number} disk - The server's disk limit
 * @param {?number} cpu - The server's CPU limit
 * @param {?number} swap - The server's swap limit
 * @param {?number} io - The server's IO limit
 * @param {?Array} add_allocations - Array of allocation IDs to be added to the server
 * @param {?Array} remove_allocations - Array of allocation IDs to be removed from the server
 * @param {?boolean} oom_disabled - Whether or not OOM Killer should be disabled
 * @returns {Promise<{server: Server}}
 */
const updateServerBuildConfiguration = (
	internal_id,
	allocation_id,
	database_limit,
	allocation_limit,
	memory,
	disk,
	cpu,
	swap,
	io,
	add_allocations,
	remove_allocations,
	oom_disabled
) => {
	return new Promise((resolve, reject) => {
		if (isNaN(internal_id)) {
			reject('Internal ID must be a number');
		}
		if (!allocation_id) {
			reject('You must supply an allocation ID');
		}
		let obj = {
			allocation_id,
			feature_limits: []
		};
		if (database_limit && typeof database_limit === 'number') {
			obj.feature_limits.push(database_limit);
		}
		if (allocation_limit && typeof allocation_limit === 'number') {
			obj.feature_limits.push(allocation_limit);
		}
		const limits = filterObject({ memory, disk, cpu, swap, io }, (val) => typeof val === 'number');
		if (memory || disk || cpu || swap || io) {
			obj = { ...obj, limits };
		}
		if (add_allocations && add_allocations.length) {
			obj = { ...obj, add_allocations };
		}
		if (remove_allocations && remove_allocations.length) {
			obj = { ...obj, remove_allocations };
		}
		if (oom_disabled !== undefined && typeof oom_disabled === 'boolean') {
			obj = { ...obj, oom_disabled };
		}
		admin
			.patchRequest('/api/application/servers/' + internal_id + '/build', obj)
			.then((response) => {
				resolve({ server: response.data.attributes });
			})
			.catch((error) => {
				reject(error);
			});
	});
};

//get
exports.getAllServers = getAllServers;
exports.getServerInformation = getServerInformation;
exports.getAllDatabases = getAllDatabases;
exports.getDatabase = getDatabase;
//post
exports.createServer = createServer;
exports.suspendServer = suspendServer;
exports.unsuspendServer = unsuspendServer;
exports.reinstallServer = reinstallServer;
exports.rebuildServer = rebuildServer;
exports.createDatabase = createDatabase;
//patch
exports.updateServerDetails = updateServerDetails;
exports.updateServerBuildConfiguration = updateServerBuildConfiguration;
//delete
exports.deleteServer = deleteServer;
