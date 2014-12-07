var path = require('path');

/* set server root dir for all module using */
global.serverRoot = path.join(__dirname);

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

/* get all routers */
var indexRt = require('./routes/index');
var loginRt = require('./routes/login');
var usersRt = require('./routes/users');
var uploadRt = require('./routes/upload');

/* create the express application */
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

/* setup and apply session management */
app.use(session({
	store: new RedisStore({host: 'localhost', port: 6379}),
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
app.use('/', indexRt);
app.use('/login', loginRt);
app.use('/users', usersRt);
app.use('/upload', uploadRt);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* error handlers */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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
