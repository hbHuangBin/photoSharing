var util = require('util');
var persisterDebug = require('debug')('persister');

global.persisterDebug = persisterDebug;

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

			persister = new MongoPersister(opts);
			persister.init(function() {
				readyCb(null, this);
			});

			break;
		}
		default: {
			readyCb(new Error('db type ['+opts.type+'] is not supported!'));
			return;
		}
	}
};

module.exports = factory;

