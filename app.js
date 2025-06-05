var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = require('config');
var cors = require("cors");

// Connecting to the database
const mongoose = require("mongoose");
const connection = config.get("mongodb");

console.log(`Connecting to ${connection}`);
mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Stop the app if the DB connection fails
  });

// Importing the routes
var tripRoutes = require('./routes/api/v1/trips'); // Routes voor trips
var userRoutes = require('./routes/api/v1/users'); // Routes voor users (toegevoegd)

// Middleware
var app = express();

// view engine setup (optioneel: overschakelen naar EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); // Je kunt dit ook naar EJS veranderen als je dat wilt

// Enable CORS
app.use(cors());

// Logging en body parsing middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Using the routes
app.use('/api/v1/trips', tripRoutes); // Gebruik de routes voor trips
app.use('/api/v1/users', userRoutes); // Gebruik de routes voor users (toegevoegd)

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
