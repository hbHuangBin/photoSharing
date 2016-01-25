/**
 * For testing auth module
 */

var authFactory = global.general.loadModule('auth');
var persisterFactory = global.general.loadModule('persister');

/**
 * Test DbAuthenticator
 */
describe('DbAuthenticator with MongoDB persister test suite', function() {

	var persister = null;

	function emptyMongoDb(done) {
		persister.db.collections(function(err, cs) {
			var l = cs.length;
			var d = 0;
			cs.forEach(function(col) {
				col.drop(function(err, res){
					if (++d >= l) {
						done();
					}
				});
			});

			if (++d >= l) {
				done();
			}
		});
	}

	beforeAll(function(done) {
		/* setup the persister and empty test database */
		persisterFactory({
			type: 'mongodb',
			host: 'localhost',
			port: 27017,
			dbname: 'photoSharing_test'
		}, function(err, p) {
			if (err) {
				console.error('Failed to setup persister: %s', err.message);
				process.exit(1);
			}

			persister = p;

			emptyMongoDb(done);
		});
	});

	afterAll(function(done) {
		persister.db.close();
		done();
	});

	beforeEach(function(done) {
		var that = this;

		/* setup a DbAuthenticator for each case */
		authFactory({
			type: 'db',
			source: "combined"
		}, function(err, authenticator) {
			if (err) {
				console.error('Failed to setup authenticator: %s', err.message);
				process.exit(1);
			}
			that.authenticator = authenticator;

			/* empty the db */
			emptyMongoDb(done);
		});
		global.eventbus.emit('persister_ready', persister);
	});


	it('can register an user', function(done) {
		this.authenticator.register('testuser1', 'testpassword1', function(err, result) {
			expect(err).toBe(null);
			expect(result && result.success === true).toBe(true);
			done();
		});
	});

	it('can auth a registered user', function(done) {
		var username = 'forauthuser';
		var password = 'password for auth';
		var that = this;
		var auth = this.authenticator;

		auth.register(username, password, function(err, result) {
			expect(err).toBe(null);
			expect(result && result.success === true).toBe(true);

			/* try to auth */
			auth.auth(username, password, function(err, result) {
				expect(err).toBe(null);
				expect(result && result.success === true).toBe(true);
				done();
			});
		});
	});
});

