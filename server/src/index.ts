import express = require('express');
import cors = require('cors');
import dotenv = require('dotenv');
import { fetchAllCitiesWeather } from './services/weatherService';
import { rankCitiesByComfort } from './services/comfortIndexService';
import { getCacheStatus, getAllCacheKeys } from './services/cacheService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.get('/api/cities', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});