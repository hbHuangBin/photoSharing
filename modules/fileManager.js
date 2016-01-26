/**
 * Utility Module for managing file inputing and caching for persisting
 * @module fileManager
 * @author nobelhuang
 * @license MIT
 */

var path = require('path');
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var util = require('util');
var EventEmitter = require('events');
var debug = require('debug')('fileManager');
var EventSynchronizer = require('./eventSynchronizer');


/**
 * @constructor
 * @param {string}	cacheDir	- directory name for caching files under system temp directory
 * @extends EventEmitter
 */
function FileManager (cacheDir) {
	this.cacheDir = cacheDir;

	var that = this;

	/** @private */
	this.fileInfos = [];
	/** @private */
	this.cachedNum = 0;

	/* prepare for the caching */
	/* create the caching directory */
	var dir = this.getTmpUploadDir();
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	/* initialize EventSynchronizer */
	/** @private */
	this.syncer = new EventSynchronizer();
	this.syncer.waitFor('nomorefiles', {
		event: 'onecached',
		recurCb: function() {
			return (that.cachedNum >= that.fileInfos.length);
		}
	});
	this.syncer.on('synced', function() {
		/**
		 * Files ready for persistence event
		 * @event FileManager#cacheready
		 */
		that.emit('cacheready');
	});

	EventEmitter.call(this);
}
util.inherits(FileManager, EventEmitter);

/**
 * Add new file input stream into the file manager, the stream will be read automatically after adding.
 *
 * @fires FileManager#cacheready
 */
FileManager.prototype.input = function (fileName, encoding, mimeType, fileStream) {
	var baseFileName = path.basename(fileName);
	var saveTarget = path.join(this.getTmpUploadDir(), genTmpFileName(baseFileName));
	var writeStream = fs.createWriteStream(saveTarget);
	var that = this;

	/**
	 * @typedef {Object}	FileManager~FileInfo
	 * @property {string}	name
	 * @property {number}	size
	 * @property {string}	encoding
	 * @property {string}	mimeType
	 * @property {string}	tempPath	- the path where the file is cached, it could be used to create read stream.
	 */
	/* gather file information */
	var fileInfo = {
		name: baseFileName,
		size: -1,// size will be populated when finishing streaming
		encoding: encoding,
		mimeType: mimeType,
		tempPath: saveTarget,
		cached: false
	};
	this.fileInfos.push(fileInfo);

	writeStream.on('finish', function() {
		fileInfo.size = fs.statSync(saveTarget).size;
		fileInfo.cached = true;
		that.cachedNum++;

		that.syncer.trigger('onecached');
	});

	fileStream.pipe(writeStream);
};

/**
 * Inform the file manager there will not be file inputs any more. Must be called once
 * determine no more inputs, otherwise would not receive ready event.
 *
 * @fires FileManager#cacheready
 */
FileManager.prototype.end = function () {
	this.syncer.trigger('nomorefiles');
};

/**
 * Get an array of cached file info.
 * @return {FileManager~FileInfo[]}
 */
FileManager.prototype.getCacheInfoArray = function () {
	return this.fileInfos.slice(0);
};

/*******************
 * Private functions
 */

/**
 * Compose the temporary directory path
 * @private
 * @return {string}	abosolute directory path for temp uploaded files
 */
FileManager.prototype.getTmpUploadDir = function () {
	return path.join(os.tmpdir(), this.cacheDir);
};


/*******************
 * Utility inner functions
 */
/**
 * Generate the temporary file name
 */
function genTmpFileName(baseFileName) {
	var shasum = crypto.createHash('sha1');
	shasum.update(Math.ceil(Math.random() * 100000000) + baseFileName, 'binary');
	return shasum.digest('hex').toUpperCase();
}

module.exports = FileManager;

