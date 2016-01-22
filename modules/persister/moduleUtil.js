var persisterDebug = require('debug')('persister');
var uuid = require('node-uuid');

module.exports = {
	debug: persisterDebug,
	uuidGen: uuid
};
