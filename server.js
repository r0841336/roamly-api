const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('config');
const createError = require('http-errors');
const tripRoutes = require('./routes/api/v1/trips');
const userRoutes = require('./routes/api/v1/users');
const reviewRoutes = require('./routes/api/v1/reviews');


const app = express();
const PORT = process.env.PORT || 5001;

// ---- Google API Routes ----
const API_KEY = 'AIzaSyBlpxT86DXT-8ugulNwJke4Oncf7yu7UcQ';
//const API_KEY = 'AIzaSyARMMWTVxjvo8qABcvXgZpHt6FJL63CDpA';
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const GEO_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Google Maps API Routes
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

app.get('/api/mapembed', (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: 'Locatie is verplicht.' });
  }
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(location)}`;
  res.json({ embedUrl });
});


app.get('/api/place/:id', async (req, res) => {
  const placeId = req.params.id;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: API_KEY,
        fields: 'name,rating,formatted_address,formatted_phone_number,website,photos,geometry,editorial_summary'
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: response.data.error_message || 'Details niet gevonden.' });
    }

    const place = response.data.result;

    res.json({
      id: placeId,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      rating: place.rating,
      description: place.editorial_summary?.overview,
      location: place.geometry?.location,
      photo: place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : 'https://via.placeholder.com/320x200'
    });
  } catch (error) {
    console.error('Fout bij ophalen van plaatsdetails:', error.message);
    res.status(500).json({ error: error.message });
  }
});



// MongoDB Verbinding
const connection = config.get('mongodb');
console.log(`Connecting to ${connection}`);
mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);


// Error handlers
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
