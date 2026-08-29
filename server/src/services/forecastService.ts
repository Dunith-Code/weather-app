import fetch from 'node-fetch';
import { getCached, setCached } from './cacheService';

const BASE_URL ='https://api.openweathermap.org/data/2.5/forecast';
const FORECAST_CACHE_TTL_SECONDS = 1800;

function getApiKey(): string {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('OPENWEATHER_API_KEY is not set in .env');
    return key;
}

export interface ForecastPoint {
    timestamp: number; // miliseconds
    temp: number;
}

export async function fetchForecastForCity(cityCode: string): Promise<ForecastPoint[]> {
    const cacheKey = `forecast:${cityCode}`;
    const cached = getCached<ForecastPoint[]>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}?id=${cityCode}&appid=${getApiKey()}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`OpenWeatherMap forecast error for city ${cityCode}: ${response.status}`);
    }

    const data: any = await response.json();

    const points: ForecastPoint[] = data.list.map((entry: any) => ({
        timestamp: entry.dt * 1000,
        temp: entry.main.temp,
    }));

    setCached(cacheKey, points, FORECAST_CACHE_TTL_SECONDS);
    return points;
}
