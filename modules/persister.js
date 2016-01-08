var util = require('util');
var persisterDebug = require('debug')('persister');
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

function connectToMongodb(opts, callback) {
	var connUrl = 'mongodb://' + opts.host + ':' + opts.port + '/' + opts.dbname;
	MongoClient.connect(connUrl, {
		db: {
			bufferMaxEntries: opts.bufferMaxEntries
		}
	}, function(err, db) {
		if (err) {
			persisterDebug("Failed to connect to mongodb database!");
			process.exit(-1);
		}
		persisterDebug("Connected to mongodb database %s", opts.dbname);
		callback(db);
	});
}

var factory = function(opts, readyCb) {
	var dbInst = null;

	function isReady() {
		if (dbInst === null) { return false; }
		return true;
	}

	/* currently only support mongodb, so it is only choice... */
	connectToMongodb(opts, function(db) {
		dbInst = db;
		if (isReady()) {
			readyCb(null, new MongoPersister(db, opts));
		}
		else {
			readyCb(new Error("Failed to create persistor"));
		}
	});
};

module.exports = factory;

/**
 * Base Persister
 */
function Persister (db, dbConnOpts, opClasses) {
	this.db = db;
	this.dbConnOpts;
	this.opClasses = opClasses;
}

/**
 * MongoPersister Class
 */
function MongoPersister (db, dbConnOpts) {
	var base = 'db/mongodb/';
	var objs = {
		User: require(base + 'user'),
		Group: require(base + 'group'),
		Album: require(base + 'album'),
		Resource: require(base + 'resource'),
		ResourceComment: require(base + 'resourceComment'),
		UserResourceRate: require(base + 'userResourceRate')
	};

	Persister.call(this, db, dbConnOpts, objs);
}
util.inherits(MongoPersister, Persister);

