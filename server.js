import express from 'express';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import config from 'config';
import createError from 'http-errors';

// ---- Google API Routes ----
const API_KEY = 'AIzaSyARMMWTVxjvo8qABcvXgZpHt6FJL63CDpA'; // Vul je echte API-sleutel hier in
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const GEO_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const app = express();
const PORT = process.env.PORT || 5001;

// CORS-instellingen
app.use(cors());
app.use(express.json());

// Route voor het ophalen van coördinaten
app.get('/api/coordinates', async (req, res) => {
  const { location } = req.query;
  try {
    const response = await axios.get(GEO_API_BASE_URL, {
      params: {
        address: location,
        key: API_KEY,
      },
    });
    if (response.data.status === 'OK') {
      const locationData = response.data.results[0].geometry.location;
      res.json(locationData);
    } else {
      res.status(400).json({ error: 'Locatie niet gevonden.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route voor het ophalen van plaatsen
app.get('/api/places', async (req, res) => {
  const { query, location, radius } = req.query;
  try {
    const response = await axios.get(PLACES_API_BASE_URL, {
      params: { query, location, radius, key: API_KEY },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RoamlyBot/1.0; +https://roamly.example.com/bot)',
      },
    });
    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: response.data.error_message || 'Geen resultaten gevonden.' });
    }

    const places = response.data.results.map((place) => {
      const coordinates = place.geometry.location;
      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        photo: place.photos
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
          : 'https://via.placeholder.com/320x200',
        location: coordinates,
      };
    });

    res.json(places);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route voor het genereren van een Google Maps Embed URL
app.get('/api/mapembed', async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: 'Locatie is verplicht.' });
  }

  try {
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(location)}`;
    res.json({ embedUrl });
  } catch (error) {
    res.status(500).json({ error: 'Kon embed URL niet genereren.' });
  }
});

// ---- MongoDB Verbinding en Routes ----

// Verbinding maken met MongoDB
const connection = config.get('mongodb');
console.log(`Connecting to ${connection}`);
mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Stop de app als de DB-verbinding mislukt
  });

// Importeer de routes voor trips en users

const tripRoutes = require('./routes/api/v1/trips');
const userRoutes = require('./routes/api/v1/users');




// Middleware
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Gebruik de routes voor trips en users
app.use('/api/v1/trips', tripRoutes); // Routes voor trips
app.use('/api/v1/users', userRoutes); // Routes voor users

// Error Handling
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Start de server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
