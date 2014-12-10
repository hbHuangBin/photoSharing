var express = require('express');
var router = express.Router();

/* GET upload page. */
router.get('/', function(req, res, next) {
	var doLayout = req.get('X-PJAX') === undefined;
	var title = 'Upload Photos';
	res.render('pjax/upload', {title: title, layout: doLayout}, function(err, html) {
		if (err) {
			next(err);
		}
		else {
			if (doLayout) {
				res.render('index', {
					title: title,
					activeNav: 'upload',
					callModuleId: 'upload',
					pageHtml: html
				});
			}
			else {
				res.send(html);
			}
		}
	});
});

module.exports = router;
