import { WeatherData } from '../types/weather';

function clampScore(value: number): number {
    return Math.max(0, Math.min(100, value));
}

function discomfortIndex(temp: number, humidity: number): number {
    return temp - 0.0055 * (100 - humidity) * (temp - 14.5);
}

function discomfortIndexScore(id: number): number {
    const IDEAL_MIN = 15;
    const IDEAL_MAX = 21;
    const PENALTY_PER_UNIT = 5;

    if (id >= IDEAL_MIN && id <= IDEAL_MAX) return 100;

    const deviation = id < IDEAL_MIN ? IDEAL_MIN - id : id - IDEAL_MAX;
    return clampScore(100 - deviation * PENALTY_PER_UNIT);
}

function windScoreFn(windSpeed: number): number {
    const IDEAL_MIN = 2;
    const IDEAL_MAX = 5;
    const PENALTY_PER_UNIT = 8;

    if (windSpeed >= IDEAL_MIN && windSpeed <= IDEAL_MAX) return 100;

    const deviation = windSpeed < IDEAL_MIN ? IDEAL_MIN - windSpeed : windSpeed - IDEAL_MAX;
    return clampScore(100 - deviation * PENALTY_PER_UNIT);
}


function cloudScoreFn(clouds: number): number {
    const IDEAL_MIN = 20;
    const IDEAL_MAX = 60;
    const PENALTY_PER_PERCENT =0.5;

    if (clouds >= IDEAL_MIN && clouds <= IDEAL_MAX) return 100;

    const deviation = clouds < IDEAL_MIN ? IDEAL_MIN -clouds : clouds - IDEAL_MAX;
    return clampScore(100 - deviation * PENALTY_PER_PERCENT);
}

export interface ComfortResult extends WeatherData {
    comfortIndex: number;
    rank?: number;
}

export function calculateComfortIndex(weather: WeatherData): number {
    const id = discomfortIndex(weather.temp, weather.humidity);
    const tempHumidityScore = discomfortIndexScore(id);
    const wind = windScoreFn(weather.windSpeed);
    const cloud = cloudScoreFn(weather.clouds);

    const comfort = 0.7 * tempHumidityScore + 0.15 * wind + 0.15 * cloud;
    return Math.round(comfort * 100) / 100;
}

export function rankCitiesByComfort(weatherList: WeatherData[]): ComfortResult[] {
    const withScores: ComfortResult[] = weatherList.map((w) => ({
        ...w,
        comfortIndex: calculateComfortIndex(w),
    }));

    withScores.sort((a, b) => b.comfortIndex - a.comfortIndex);
    withScores.forEach((city, index) => {
        city.rank = index + 1;
    });

    return withScores;
}