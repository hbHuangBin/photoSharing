var persisterDebug = require('debug')('persister');
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

function connectToDb(opts, callback) {
	var connUrl = 'mongodb://' + opts.host + ':' + opts.port + '/' + opts.dbname;
	MongoClient.connect(connUrl, {
		db: {
			bufferMaxEntries: opts.bufferMaxEntries
		}
	}, function(err, db) {
		if (err) {
			persisterDebug("Failed to connect to database!");
			process.exit(-1);
		}
		persisterDebug("Connected to database %s", opts.dbname);
		callback(db);
	});
}

var expConstructor = function(opts, readyCb) {
	var persistor = {};
	var dbInst = null;

	function isReady() {
		if (dbInst === null) { return false; }
		return true;
	}

	connectToDb(opts, function(db) {
		dbInst = db;
		if (isReady()) { readyCb(); }
	});

	return persistor;
};

module.exports = expConstructor;
