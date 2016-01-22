var util = require('util');
var myutil = require('./moduleUtil');
var crypto = require('crypto');

function DbAuthenticator(sourceType, sourceOpts, callback) {
	this.sourceType = sourceType;
	this.sourceOpts = sourceOpts;
	this.dbPersister = null;

	var that = this;
	if (this.sourceType === DbAuthenticator.SRC_INTERNAL) {
		/* wait for internal persister ready and hold it then */
		global.eventbus.on('persister_ready', function(persister) {
			that.dbPersister = persister;
			if (callback) {
				callback.call(that);
			}
		});
	}
	else if (this.sourceType === DbAuthenticator.SRC_EXTERNAL) {
		/* construct a db persister by factory provided in sourceOpts */
		// TODO:
	}
	else {
		throw new TypeError('Failed to create DbAuthenticator, source type ['+sourceType+'] is not supported!');
	}
}

/**
 * Adopt SHA256 to calculate hash for password with salt. Return hex representation string of hash result.
 *
 * - password: any characters in utf8 encoding
 * - salt: hex representation string of 256bit (32 bytes) random binary
 */
function calcPasswordHash(password, salt) {
	var hashFunc = crypto.createHash('sha256');
	hashFunc.update(salt + password, 'utf8');
	return hashFunc.digest('hex');
}

/**
 * Given the user name and logical clear-texted password, auth the user against stored auth info.
 *
 * callback(err, {success, message})
 */
DbAuthenticator.prototype.auth = function(username, password, callback) {
	var that = this;

	if (!this.dbPersister) {
		setImmediate(function(){
			callback.call(that, new Error('authenticator not ready'));
		});
		return;
	}

	this.dbPersister.getUserPwdHashInfo(username, function(err, hashInfo) {
		if (err) {
			callback.call(that, err);
			return;
		}

		if (!hashInfo) {
			/* cannot find corresponding user */
			myutil.debug('Cannot get hash info for user [%s]', username);
			callback.call(that, null, {success: false, message: 'user does not exist'});
			return;
		}

		var myHash = calcPasswordHash(password, hashInfo.salt);

		if (myHash.toLowerCase() === hashInfo.hash.toLowerCase()) {
			/* successful authentication */
			callback.call(that, null, {success: true});
		}
		else {
			callback.call(that, null, {success: false, message: 'password is incorrect'});
		}
	});
};

/**
 * Given the user name (email address) and logical clear-texted password, register an user
 * with this system. This involves generating properly hashed password for the registered
 * user, other information of this user can be complemented later using updateUserInfo().
 *
 * callback(err, {success, message})
 */
DbAuthenticator.prototype.register = function(username, password, callback) {
	var that = this;

	if (!this.dbPersister) {
		setImmediate(function(){
			callback.call(that, new Error('authenticator not ready'));
		});
		return;
	}

	/* check if there is user with the same username */
	that.dbPersister.getUserHandle(username, function(err, userHandle) {
		if (err) {
			myutil.debug('Failed to query userHandle by username: %s', err.message);
			callback.call(that, new Error('Failed to query userHandle by username'));
			return;
		}
		if (userHandle) {
			/* user with the same exists */
			myutil.debug('the user name is in used');
			callback.call(that, null, {success: false, message: "The user name is used"});
			return;
		}

		/* generate unique salt fot this user */
		crypto.randomBytes(32, function(err, buf) {
			if (err) {
				myutil.debug('Failed to generate salt: %s', err.message);
				callback.call(that, new Error('Failed to generate password salt'));
				return;
			}

			var salt = buf.toString('hex');
			var pwdHash = calcPasswordHash(password, salt);

			/* save to database */
			that.dbPersister.saveNewUser({
				username: username,
				passwordHash: {
					hash: pwdHash,
					salt: salt
				}
			}, function(err, userHandle) {
				if (err) {
					myutil.debug('Failed to save user: %s', err.message);
					callback.call(that, new Error('Failed to save user'));
					return;
				}

				that.dbPersister.getUserProps(userHandle, ['username'], function(err, props) {
					if (!err) {
						myutil.debug('New user [%s] is saved', props.username);
					}
				});

				callback.call(that, null, {success: true});
			});
		});
	});

};

/* static properties */
DbAuthenticator.SRC_INTERNAL = 'internal';
DbAuthenticator.SRC_EXTERNAL = 'external';

module.exports = DbAuthenticator;
