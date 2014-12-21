var debug = global.mainDebug;
var express = require('express');
var nconf = require('nconf');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var persisterFactory = require('./modules/persister');

/* get all routers */
var indexRt = require('./routes/index');
var loginRt = require('./routes/login');
var uploadRt = require('./routes/upload');
/* REST routers */
var rest_resRt = require('./routes/rest/res');
var rest_usersRt = require('./routes/rest/users');

/* create the express application */
var app = express();

/* create global persister */
global.persister = persisterFactory(nconf.get('db'), function() {});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

/* setup and apply session management */
app.use(session({
	store: new RedisStore({
		host: nconf.get('redis').host,
		port: nconf.get('redis').port
	}),
	secret: 'beautiful girl',
	resave: false,
	saveUninitialized: false,
	cookie: {
		path: '/',
		httpOnly: true,
		secure: false,
		maxAge: 365 * 24 * 3600 * 1000
	}
}));
app.use(function(req, res, next) {
	/* in case session is not initialized when connection is lost */
	if (!req.session) {
		next(new Error('Session is temporarily unavaliable'));
	}
	else { next(); }
});

/* other middlewares */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* apply router policies */
app.use('/login', loginRt);
/* TODO: add session check middleware here */
/* routers below require logged-in user session */
app.use('/', indexRt);
app.use('/upload', uploadRt);
app.use('/res', rest_resRt);
app.use('/users', rest_usersRt);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* error handlers */

// development error handler
// will print stacktrace
if (nconf.get('NODE_ENV') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
