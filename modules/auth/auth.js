var util = require('util');
var myutil = require('./moduleUtil');

var DbAuthenticator = require('./dbAuthenticator');

function factory(opts, readyCb) {
	var authenticator = null;

	switch (opts.type) {
		case 'db': {
			if (opts.source === 'combined') {
				/* auth information located in the same db */
				authenticator = new DbAuthenticator(DbAuthenticator.SRC_INTERNAL, null, function() {
					myutil.debug('One authenticator using combined db is ready...');
					readyCb(null, this);
				});
			}
			else if (typeof(opts.source) === 'object') {
				/* auth information in external db specified by this object */
				// TODO:
			}
			else {
				readyCb(new TypeError('auth db source ['+opts.source+'] is not supported!'));
				return;
			}

			break;
		}
		default: {
			readyCb(new TypeError('auth type ['+opts.type+'] is not supported!'));
			return;
		}
	}
}

module.exports = factory;
