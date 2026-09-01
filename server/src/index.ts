import express = require('express');
import cors = require('cors');
import dotenv = require('dotenv');
import { fetchAllCitiesWeather } from './services/weatherService';
import { rankCitiesByComfort } from './services/comfortIndexService';
import { getCacheStatus, getAllCacheKeys } from './services/cacheService';
import { checkJwt } from './middleware/checkJwt';
import { getAllHistory } from './services/historyService';
import { fetchForecastForCity } from './services/forecastService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Weather Analytics API',
    endpoints: {
      health: '/api/health',
      cities: '/api/cities',
      forecast: '/api/forecast/:cityCode',
      cache: '/api/debug/cache'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/test-weather', async (req, res) => {
    try {
        const data = await fetchAllCitiesWeather();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Protected route, requires valid JWT from Auth0
app.get('/api/cities', checkJwt, async (req, res) => {
    try {
        const weatherList = await fetchAllCitiesWeather();
        const ranked = rankCitiesByComfort(weatherList);
        res.json(ranked);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/debug/cache', async (req, res) => {
    const keys = getAllCacheKeys();
    const status = keys.map((key) => ({
        key,
        status: getCacheStatus(key),
    }));
    res.json({ cacheKeys: status, totalCached: keys.length });;
});


app.get('/api/history', checkJwt, (req, res) => {
    res.json(getAllHistory());
});

app.get('/api/forecast/:cityCode', checkJwt, async (req, res) => {
    try {
        const cityCode = req.params.cityCode as string;
        const points = await fetchForecastForCity(cityCode);
        res.json(points);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});