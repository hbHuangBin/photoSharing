/**
 * Provide general use of environment variables, functions in global.general
 * Or setup some other global required variables.
 */

var EventEmitter = require('events');
var path = require('path');
var moduleDir = '../../modules';

global.general = {
	loadModule: function(moduleName) {
		return require(path.join(moduleDir, moduleName));
	}
};

/**
 * This is required for some modules
 */
global.eventbus = new EventEmitter();
