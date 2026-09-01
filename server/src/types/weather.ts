export interface CityEntry {
    CityCode: string;
    CityName: string;
    Temp: string;
    Status: string;
}

export interface WeatherData {
    cityCode: string;
    cityName: string;
    description: string;
    temp: number;
    humidity: number;
    windSpeed: number;
    clouds: number;
    pressure: number;
    visibility: number;
}