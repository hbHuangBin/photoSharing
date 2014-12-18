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
		//res.redirect('/');
		//return;
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
	/* sign in with credential */
	var username = req.body.user;
	var password = req.body.pw;
	var authRes = null;

	if (!username || !password) {
		res.status(400).json({
			success: false,
			msg: "Insufficient credential"
		});
		return;
	}

	req.session.loginStatus = LoginStatus.LOGGING;

	/* XXX: only for development, authentication should be in separated module */
	if (username === "testuser" && password === "password") {
		authRes = { success: true };
	}
	else {
		authRes = {
			success: false,
			msg: "Auth failed"
		};
	}

	if (authRes.success === true) {
		req.session.loginStatus = LoginStatus.AUTHENTICATED;

		/* TODO: prepare for a logged in user */

		/* now the user is logged in */
		req.session.loginStatus = LoginStatus.LOGGEDIN;

		res.json({
			success: true,
			next: "/"
		});
	}
	else {
		res.json({
			success: false,
			msg: authRes.msg ? authRes.msg : "Invalid username or password!"
		});
	}
});

module.exports = router;
