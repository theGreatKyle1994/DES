// SPT
import type { ISeasonalValues } from "@spt/models/spt/config/IWeatherConfig";

export interface WeatherDB {
    weatherName: string;
    weatherLength: number;
    weatherLeft: number;
}

export interface WeatherConfig {
    name: string;
    weather: ISeasonalValues;
}

interface WeatherWeights {
    [key: string]: number;
}

export interface WeatherWeightsConfig {
    SUMMER: WeatherWeights;
    AUTUMN: WeatherWeights;
    WINTER: WeatherWeights;
    SPRING: WeatherWeights;
    AUTUMN_LATE: WeatherWeights;
    SPRING_EARLY: WeatherWeights;
}
