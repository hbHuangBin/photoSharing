var util = require('util');
var myutil = require('./moduleUtil');

/* include all types of persisters */
var MongoPersister = require('./mongoPersister');


var factory = function(opts, readyCb) {
	var persister = null;

	/* currently only support mongodb, so it is only choice... */
	switch (opts.type) {
		case 'mongodb': {
			if (!opts.host || !opts.port || !opts.dbname) {
				readyCb(new Error('Insufficient db connecting parameters'));
				return;
			}

			persister = new MongoPersister(opts, function() {
				myutil.debug('One mongodb persister is ready...');
				readyCb(null, this);
			});

			break;
		}
		default: {
			readyCb(new TypeError('db type ['+opts.type+'] is not supported!'));
			return;
		}
	}
};

module.exports = factory;

