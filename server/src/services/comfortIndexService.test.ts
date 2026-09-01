import { calculateComfortIndex, rankCitiesByComfort } from './comfortIndexService';
import { WeatherData } from '../types/weather';
import { describe, expect, test } from '@jest/globals';

function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
    return {
        cityCode: '0000000',
        cityName: 'TestCity',
        description: 'clear sky',
        temp: 20,
        humidity: 45,
        windSpeed: 3,
        clouds: 40,
        pressure: 1013,
        visibility: 10000,
        ...overrides,
    };
}

describe('calculateComfortIndex', () => {
    test('mild, dry, breezy, conditions score high (comfortable)', () => {
        const weather = makeWeather({ temp: 18, humidity: 40, windSpeed: 3, clouds: 40 });
        const score = calculateComfortIndex(weather);
        expect(score).toBeGreaterThanOrEqual(85);
    });

    test('hot and humid conditions score low (uncomfortable)', () => {
        const weather = makeWeather({ temp: 34, humidity: 90, windSpeed: 8, clouds: 100 });
        const score = calculateComfortIndex(weather);
        expect(score).toBeLessThan(65);
    });

    test('score is always clamped between 0 and 100', () => {
        const extreme = makeWeather({ temp: 45, humidity: 100, windSpeed: 20, clouds: 100 });
        const score = calculateComfortIndex(extreme);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    test('humidity penalty is stronger when it is already hot (intersection effect)', () => {

        const hotHumid = makeWeather({ temp: 32, humidity: 85, windSpeed: 3, clouds: 40 });
        const mildHumid = makeWeather({ temp: 18, humidity: 85, windSpeed: 3, clouds: 40 });

        const hotScore = calculateComfortIndex(hotHumid);
        const mildScore = calculateComfortIndex(mildHumid);

        expect(hotScore).toBeLessThan(mildScore);
    });

    test('returns a number rounded to 2 decimal places', () => {
        const weather = makeWeather({ temp: 22.7, humidity: 55, windSpeed: 4, clouds: 30 });
        const score = calculateComfortIndex(weather);
        const decimalPlaces = (score.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    test('visibility penalty: low visibility scores lower than clear visibility', () => {
        const clearWeather = makeWeather({
            temp: 22, humidity: 50, windSpeed: 3, clouds: 30,
            pressure: 1013, visibility: 10000,
        });
        const foggyWeather = makeWeather({
            temp: 22, humidity: 50, windSpeed: 3, clouds: 30,
            pressure: 1013, visibility: 1500,
       });
        const clearScore = calculateComfortIndex(clearWeather);
        const foggyScore = calculateComfortIndex(foggyWeather);
        expect(clearScore).toBeGreaterThan(foggyScore);
        });
});

describe('rankCitiesByComfort', () => {
    test('ranks cities from most to least comfortable', () => {
        const cities = [
            makeWeather({ cityCode: '1', cityName: 'HotCity', temp: 35, humidity: 90 }),
            makeWeather({ cityCode: '2', cityName: 'MildCity', temp: 20, humidity: 45 }),
            makeWeather({ cityCode: '3', cityName: 'ColdCity', temp: 2, humidity: 80 }),
        ];

        const ranked = rankCitiesByComfort(cities);

        expect(ranked.map((c) => c.rank)).toEqual([1, 2, 3]);

        // Comfort Scores should be in decending order
        for (let i = 0; i < ranked.length - 1; i++) {
            expect(ranked[i].comfortIndex).toBeGreaterThanOrEqual(ranked[i + 1].comfortIndex);
        }

        // rank first - mildesst city 
        expect(ranked[0].cityName).toBe('MildCity');
    });

    test('handles a single city without errors', () => {
        const cities = [makeWeather({ cityCode: '1', cityName: 'OnlyCity' })];
        const ranked = rankCitiesByComfort(cities);
        expect(ranked).toHaveLength(1);
        expect(ranked[0].rank).toBe(1);
    });

    test('handles an empty list without errors', () => {
        const ranked = rankCitiesByComfort([]);
        expect(ranked).toEqual([]);
    });
});