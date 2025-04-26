import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

const API_KEY = 'AIzaSyARMMWTVxjvo8qABcvXgZpHt6FJL63CDpA'; // Vervang dit door je echte API-sleutel
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const GEO_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// CORS-instellingen
app.use(cors());

app.use(express.json());

// Route voor het ophalen van coördinaten op basis van een locatie (gebruikt de Geocode API)
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

// Route voor het ophalen van plaatsen (hotels, restaurants, etc.)
app.get('/api/places', async (req, res) => {
  const { query, location, radius } = req.query;
  try {
    const response = await axios.get(PLACES_API_BASE_URL, {
      params: {
        query,
        location,
        radius,
        key: API_KEY,
      },
    });
    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: response.data.error_message || 'Geen resultaten gevonden.' });
    }
    const places = response.data.results.map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      photo: place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : 'https://via.placeholder.com/320x200',
    }));
    res.json(places);
  } catch (error) {
    console.error(error.response?.data || error.message); // 👈 verbeterde error logging

    res.status(500).json({ error: error.message });
  }
});

// Start de server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
