var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
	  title: 'Photo Sharing',
	  activeNav: 'interesting'
  });
});

module.exports = router;
