/**
 * Provide ability to persist app data with mongodb
 * @module persister/mongoPersister
 */

var util = require('util');
var myutil = require('./moduleUtil');
var Persister = require('./basePersister');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

/**
 * MongoPersister Class
 * @constructor
 * @extends Persister
 */
function MongoPersister (dbConnOpts, callback) {
	var base = 'db/mongodb/';
	var objs = {
		User: require(base + 'user'),
		Group: require(base + 'group'),
		Album: require(base + 'album'),
		Resource: require(base + 'resource'),
		ResourceComment: require(base + 'resourceComment'),
		UserResourceRate: require(base + 'userResourceRate')
	};

	Persister.call(this, dbConnOpts, objs, callback);
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


/*************************************
 * User related APIs
 ************************************/

/**
 * Given user name, returns the userHandle via callback function. The userHandle could be used
 * later in other functions requiring it as mandatory parameter, it is not supposed to use directly.
 *
 * If the username cannot be found, userHandle will be null.
 *
 * callback(err, userHandle)
 */
MongoPersister.prototype.getUserHandle = function(username, callback) {
	var User = this.opClasses.User;

	User.findOne(this.db, {loginName: username}, function(err, userObj) {
		if (err) {
			callback(err);
			return;
		}

		/* just use the user object as its handle */
		callback(null, userObj);
	});
};

/**
 * Given prefetched userHandle and requested property name array, returns named properties of the
 * corresponding user via callback. Only can limited number of properties be retrieved in this way:
 *
 * username, displayName, isAdmin,
 *
 * if other property names are given, they will be returned as undefined in result.
 */
MongoPersister.prototype.getUserProps = function(userHandle, propsNameArr, callback) {
	var User = this.opClasses.User;
	var props = {};

	/* as we use composed user object as its handle */
	if (!(userHandle instanceof User)) {
		setImmediate(function() {
			callback(new TypeError('Type of userHandle is not valid'));
		});
		return;
	}

	propsNameArr.every(function(name, index, arr) {
		switch (name) {
			case 'username':
				props[name] = userHandle.loginName;
				break;

			case 'displayName':
			case 'isAdmin':
				props[name] = userHandle[name];
				break;

			default:
				props[name] = undefined;
		}
		return true;
	});

	setImmediate(function() {
		callback(null, props);
	});
};

/**
 * Given user name, this function lookups user's password hash information in db and return
 * them for further calculation.
 *
 * Error would not be issued if the user could not be found, but hashInfo would be null then.
 *
 * callback(err, hashInfo)
 */
MongoPersister.prototype.getUserPwdHashInfo = function(username, callback) {
	var User = this.opClasses.User;

	User.findOne(this.db, {loginName: username}, function(err, userObj) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, userObj ? userObj.passwordHash : null);
	});
};

/**
 * Insert a new user entry by providing some essential configs.
 * @param {Object}	userConfig		- config for the to-added user
 * @param {string}	userConfig.username		- user name
 * @param {Object}	userConfig.passwordHash	- hash information of password
 * @param {string}	userConfig.passwordHash.hash	- string representation of hashed password
 * @param {string}	userConfig.passwordHash.salt	- string representation of generated salt
 * @param {string}	userConfig.displayName	- Nickname for the user
 * @param {Persister~saveNewUserCallback} callback	- callback to return the saved user handle
 */
MongoPersister.prototype.saveNewUser = function(userConfig, callback) {
	var User = this.opClasses.User;

	var newUser = new User(myutil.uuidGen.v1(), userConfig.username, userConfig.displayName, false, userConfig.passwordHash,
						   [], [], []);

	newUser.insert(this.db, function(err, res) {
		if (err) {
			myutil.debug('Insert new user [%s] failed: %s', userConfig.username, err.message);
			callback(new Error('Persistence operation: insertion failed'));
			return;
		}

		callback(null, res);
	});
};


module.exports = MongoPersister;
