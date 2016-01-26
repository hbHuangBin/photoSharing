/**
 * For testing FileManager module
 * @author nobelhuang
 */

var fs = require('fs');
var FileManager = global.general.loadModule('fileManager');

describe('FileManager test suite', function() {

	beforeEach(function() {
		this.fm = new FileManager('pstest');
	});

	it('can cache several file streams', function(done) {

		var dataFiles = ['dream1.jpg', 'dream2.jpg', 'dream3.jpg'];
		var that = this;

		this.fm.on('cacheready', function() {
			var cacheFileArr = that.fm.getCacheInfoArray();
			expect(cacheFileArr.length).toBe(dataFiles.length);
			done();
		});

		dataFiles.forEach(function(fileName) {
			var absFileName = global.general.getDataFilePath(fileName);
			var stream = fs.createReadStream(absFileName);
			that.fm.input(absFileName, 'binary', 'image/jpeg', stream);
		});

		this.fm.end();
	});
});
