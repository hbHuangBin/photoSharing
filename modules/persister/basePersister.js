var debug = global.persisterDebug;

/**
 * Base Persister
 */
function Persister (dbConnOpts, opClasses) {
	this.db = null;	/* db should be initialized in init() invoking */
	this.dbConnOpts = dbConnOpts;
	this.opClasses = opClasses;
}

Persister.prototype.init = function(callback) {
	var that = this;

	/* connecting to the database and set the db instance */
	this.connect(function(err, db) {
		if (err) {
			debug("Failed to connect to %s database: %s", that.dbConnOpts.type, err.message);
			process.exit(-1);
		}

		debug("Connected to %s database %s", that.dbConnOpts.type, that.dbConnOpts.dbname);
		that.db = db;
		if (callback) {
			callback.call(that);
		}
	});
};

/* connectCb			- function(err, db)
 */
Persister.prototype.connect = function(connectCb) {
	throw new ReferenceError('Subclass must implement their own connect() function!');
};

module.exports = Persister;
