var util = require('util');
var Persister = require('./basePersister');
var debug = global.persisterDebug;
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

/**
 * MongoPersister Class
 */
function MongoPersister (dbConnOpts) {
	var base = 'db/mongodb/';
	var objs = {
		User: require(base + 'user'),
		Group: require(base + 'group'),
		Album: require(base + 'album'),
		Resource: require(base + 'resource'),
		ResourceComment: require(base + 'resourceComment'),
		UserResourceRate: require(base + 'userResourceRate')
	};

	Persister.call(this, dbConnOpts, objs);
}
util.inherits(MongoPersister, Persister);

/* implement virtual function to connect to mongodb */
MongoPersister.prototype.connect = function(connectCb) {
	var opts = this.dbConnOpts;
	var connUrl = 'mongodb://' + opts.host + ':' + opts.port + '/' + opts.dbname;
	MongoClient.connect(connUrl, {
		db: {
			bufferMaxEntries: opts.bufferMaxEntries
		}
	}, connectCb);
};


module.exports = MongoPersister;
