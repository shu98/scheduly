var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

// Authentication stuff 
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
// export MONGOLAB_URI = 'mongodb://shu98:hbSweet1998@ds111598.mlab.com:11598/todo';
// var url = process.env.MONGOLAB_URI;
mongoose.connect('mongodb://localhost/anothertestdb' || 'mongodb://shu98:hbSweet1998@ds111598.mlab.com:11598/todo');

var connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'MongoDB connection error'));

connection.on('connected', function() {
	console.log('database connected!');
});

var index = require('./routes/index');
var users = require('./routes/users');
var tasks = require('./routes/tasks');
var updates = require('./routes/update');
var user = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());

// More authentication stuff 
app.use(session({ secret: 'my super secret secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/tasks', tasks);
app.use('/update', updates);

var User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
