var express = require('express');
var router = express.Router();

var LoginStatus = {
	NONE:			0,
	INIT:			1,
	LOGGING:		2,
	AUTHENTICATED:	3,
	LOGGEDIN:		4
};

/* get login page */
router.get('/', function(req, res) {
	var sess = req.session;
	sess.loginStatus = sess.loginStatus === undefined ? LoginStatus.NONE : sess.loginStatus;

	/* no need to do login again for loggedIn user */
	if (sess.loginStatus === LoginStatus.LOGGEDIN) {
		res.redirect('/');
		return;
	}

	/* for new attempting login user we generate the session, otherwise reuse it */
	if (sess.loginStatus < LoginStatus.INIT) {
		sess.regenerate(function(err) {
			req.session.loginStatus = LoginStatus.INIT;
			res.render('login', {
				title: 'Login'
			});
		});
	}
	else {
		res.render('login', {
			title: 'Login'
		});
	}
});

/* perform login sign in action */
router.post('/signin', function(req, res) {
	/* TODO: sign in with credential */
});

module.exports = router;
