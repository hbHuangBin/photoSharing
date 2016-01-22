var myutil = require('./moduleUtil');

/**
 * Base Persister
 */
function Persister (dbConnOpts, opClasses, callback) {
	this.db = null;	/* db should be initialized when connect */
	this.dbConnOpts = dbConnOpts;
	this.opClasses = opClasses;

	var that = this;

	/* connecting to the database and set the db instance */
	this.connect(function(err, db) {
		if (err) {
			myutil.debug("Failed to connect to %s database: %s", that.dbConnOpts.type, err.message);
			process.exit(-1);
		}

		myutil.debug("Connected to %s database %s", that.dbConnOpts.type, that.dbConnOpts.dbname);
		that.db = db;
		if (callback) {
			callback.call(that);
		}
	});
}

/* connectCb			- function(err, db)
 */
Persister.prototype.connect = function(connectCb) {
	throw new ReferenceError('Subclass must implement their own connect() function!');
};

module.exports = Persister;
