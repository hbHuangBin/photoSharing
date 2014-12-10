var path = require('path');
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();

/******************************************************************************
 * POST operation for adding resources
 */
function getTmpUploadDir() {
	return path.join(os.tmpdir(), 'psupload');
}

function uploadPrepare(req, res) {
	req.files = [];
	req.files.completeNum = 0;

	var dir = getTmpUploadDir();
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}

function uploadComplete(req, res) {
	if (req.files && req.files.length > 0) {
		/* TODO: consequent processing */
		res.json({success: true});
	}
	else {
		res.status(500).json({success: false, msg: "Cannot parse uploaded files"});
	}
}

function genTmpFileName(baseFileName) {
	var shasum = crypto.createHash('sha1');
	shasum.update(Math.ceil(Math.random() * 100000000) + baseFileName, 'binary');
	return shasum.digest('hex').toUpperCase();
}

/* POST for adding a photo */
router.post('/', function(req, res) {
	uploadPrepare(req, res);

	req.busboy.on('file', function(fieldName, file, filename, encoding, mimeType) {
		var baseFileName = path.basename(filename);
		var saveTarget = path.join(getTmpUploadDir(), genTmpFileName(baseFileName));
		var writeStream = fs.createWriteStream(saveTarget);

		/* set file information in request for later use*/
		var fileInfo = {
			name: baseFileName,
			size: -1,
			mimeType: mimeType,
			tempPath: saveTarget
		};
		req.files.push(fileInfo);

		writeStream.on('finish', function() {
			fileInfo.size = fs.statSync(saveTarget).size;

			if (req.multipartParseFinish && ++req.files.completeNum >= req.files.length) {
				uploadComplete(req, res);
			}
		});

		file.pipe(writeStream);
	});

	req.busboy.on('field', function(fieldName, val, fieldNameTruncated, valTruncated) {
		/* ignore all other fields */
	});

	req.busboy.on('finish', function() {
		req.multipartParseFinish = true;

		if (req.files.completeNum >= req.files.length) {
			uploadComplete(req, res);
		}
	});

	/* start parsing */
	req.pipe(req.busboy);
});

module.exports = router;
