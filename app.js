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
var tripRoutes = require('./routes/api/v1/trips'); // Verander tripRouter naar tripRoutes voor consistentie

var app = express();

// view engine setup (optioneel: overschakelen naar EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); // Je kunt dit ook naar EJS veranderen als je dat wilt

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Using the routes
app.use('/api/v1/trips', tripRoutes); // Zorg ervoor dat tripRoutes consistent wordt genoemd

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
