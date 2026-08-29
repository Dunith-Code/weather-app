import fetch from 'node-fetch';
import citiesData from '../data/cities.json';
import { CityEntry, WeatherData } from '../types/weather';
import { getCached, setCached } from './cacheService';
import { recordReading } from './historyService';

// const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

function getApiKey(): string {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('OPENWEATHER_API_KEY is not set in .env');
    return key;
}

export async function fetchWeatherForCity(cityCode: string): Promise<WeatherData> {
    const cacheKey = `weather:${cityCode}`;
    const cached = getCached<WeatherData>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}?id=${cityCode}&appid=${getApiKey()}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`OpenWeatherMap error for city ${cityCode}: ${response.status}`);
    }

    const data: any = await response.json();

    const weather: WeatherData = {
        cityCode,
        cityName: data.name,
        description: data.weather[0].description,
        temp: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        clouds: data.clouds.all,
        pressure: data.main.pressure,
    };

    // record this reading
    recordReading(cityCode, weather.temp);

    setCached(cacheKey, weather);
    return weather;
}

export function getCityCodes(): string[] {
    return (citiesData.List as CityEntry[]).map((c) => c.CityCode);
}

export async function fetchAllCitiesWeather(): Promise<WeatherData[]> {
    const codes = getCityCodes();
    const results = await Promise.all(codes.map((code) => fetchWeatherForCity(code)));
    return results;
}