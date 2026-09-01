import { WeatherData } from '../types/weather';

// added export to interface
export interface ComfortResult extends WeatherData {
    comfortIndex: number;
    rank?: number;
}

function clampScore(value: number): number {
    return Math.max(0, Math.min(100, value));
}

/**
 * Thom's Discomfort Index
 * low humidity = sweat evaporates = body cools
 * Id = T - 0.0055 * (100 - RH) * (T - 14.5)
 */
function discomfortIndex(temp: number, humidity: number): number {
    return temp - 0.0055 * (100 - humidity) * (temp - 14.5);
}

/**
 * Maps Thom's Discomfort Index to a 0-100 comfort score
 * Ideal range: 15-21°C (most comfortable)
 * Linear penalty: 5 points per unit outside the ideal range
 */
function discomfortIndexScore(id: number): number {
    const IDEAL_MIN = 15;
    const IDEAL_MAX = 21;
    const PENALTY_PER_UNIT = 5;

    if (id >= IDEAL_MIN && id <= IDEAL_MAX) return 100;

    const deviation = id < IDEAL_MIN ? IDEAL_MIN - id : id - IDEAL_MAX;
    return clampScore(100 - deviation * PENALTY_PER_UNIT);
}

// wind
function windScoreFn(windSpeed: number): number {
    const IDEAL_MIN = 2;
    const IDEAL_MAX = 5;
    const PENALTY_PER_UNIT = 8;

    if (windSpeed >= IDEAL_MIN && windSpeed <= IDEAL_MAX) return 100;

    const deviation = windSpeed < IDEAL_MIN ? IDEAL_MIN - windSpeed : windSpeed - IDEAL_MAX;
    return clampScore(100 - deviation * PENALTY_PER_UNIT);
}

// cloud
function cloudScoreFn(clouds: number): number {
    const IDEAL_MIN = 20;
    const IDEAL_MAX = 60;
    const PENALTY_PER_PERCENT =0.5;

    if (clouds >= IDEAL_MIN && clouds <= IDEAL_MAX) return 100;

    const deviation = clouds < IDEAL_MIN ? IDEAL_MIN -clouds : clouds - IDEAL_MAX;
    return clampScore(100 - deviation * PENALTY_PER_PERCENT);
}

// pressure
function pressureScoreFn(pressure: number): number {
    const IDEAL_MIN = 1010;
    const IDEAL_MAX = 1020;
    const PENALTY_PER_UNIT = 0.5;

    if (pressure >= IDEAL_MIN && pressure <= IDEAL_MAX) return 100;

    const deviation = pressure < IDEAL_MIN ? IDEAL_MIN - pressure : pressure - IDEAL_MAX;
    return clampScore(100 - deviation * PENALTY_PER_UNIT);
}

// visbility
function visibilityScoreFn(visibility: number): number {
    const IDEAL_MIN = 8000;
    const PENALTY_PER_UNIT = 100/8000;

    if (visibility >= IDEAL_MIN) return 100;

    const deviation = IDEAL_MIN - visibility;
    return clampScore(100 - deviation * PENALTY_PER_UNIT);
}

export function calculateComfortIndex(weather: WeatherData): number {
    const id = discomfortIndex(weather.temp, weather.humidity);
    const tempHumidityScore = discomfortIndexScore(id);
    const wind = windScoreFn(weather.windSpeed);
    const cloud = cloudScoreFn(weather.clouds);
    const pressure = pressureScoreFn(weather.pressure);
    const visibility = visibilityScoreFn(weather.visibility);

    const comfort = 0.65 * tempHumidityScore + 0.10 * wind + 0.10 * cloud + 0.10 * pressure + 0.05 * visibility;
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