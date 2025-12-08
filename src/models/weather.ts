// SPT Imports
import type { ISeasonalValues } from "@spt/models/spt/config/IWeatherConfig";

export interface WeatherDB {
  weatherName: WeatherName;
  weatherLength: number;
  weatherLeft: number;
}

export interface WeatherWeights {
  STORMY: number;
  FOGGY: number;
  WINDY: number;
  MISTY: number;
  SUNNY: number;
}

export enum WeatherName {
  DEFAULT = "DEFAULT",
  STORMY = "STORMY",
  FOGGY = "FOGGY",
  WINDY = "WINDY",
  MISTY = "MISTY",
  SUNNY = "SUNNY",
}

export const weatherDBDefaults = {
  weatherName: "SUNNY",
  weatherLength: 3,
  weatherLeft: 3,
};

interface WeatherLayouts {
  DEFAULT: ISeasonalValues;
  STORMY: ISeasonalValues;
  FOGGY: ISeasonalValues;
  WINDY: ISeasonalValues;
  MISTY: ISeasonalValues;
  SUNNY: ISeasonalValues;
}

export const weatherLayouts: WeatherLayouts = {
  DEFAULT: {
    clouds: {
      values: [-1, -0.8, -0.5, 0.1, 0, 0.15, 0.4, 1],
      weights: [70, 22, 22, 15, 15, 15, 5, 4],
    },
    windSpeed: {
      values: [0, 1, 2, 3, 4],
      weights: [6, 3, 2, 1, 1],
    },
    windDirection: {
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      weights: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    windGustiness: {
      min: 0,
      max: 1,
    },
    rain: {
      values: [1, 2, 3, 4, 5],
      weights: [20, 1, 1, 1, 1],
    },
    rainIntensity: {
      min: 0,
      max: 1,
    },
    fog: {
      values: [0.0013, 0.0018, 0.002, 0.004, 0.006],
      weights: [35, 6, 4, 3, 1],
    },
    temp: {
      day: {
        min: 9,
        max: 32,
      },
      night: {
        min: 2,
        max: 16,
      },
    },
    pressure: {
      min: 760,
      max: 780,
    },
  },
  STORMY: {
    clouds: {
      values: [-1, -0.8, -0.5, 0.1, 0, 0.4, 0.8, 1],
      weights: [0, 0, 0, 0, 0, 1, 1, 1],
    },
    windSpeed: {
      values: [0, 1, 2, 3, 4],
      weights: [0, 0, 0, 1, 1],
    },
    windDirection: {
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      weights: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    windGustiness: {
      min: 0.8,
      max: 1,
    },
    rain: {
      values: [1, 2, 3, 4, 5],
      weights: [0, 0, 0, 1, 1],
    },
    rainIntensity: {
      min: 0.6,
      max: 1,
    },
    fog: {
      values: [0.0013, 0.0018, 0.004, 0.006, 0.008],
      weights: [0, 0, 2, 3, 2],
    },
    temp: {
      day: {
        min: 9,
        max: 32,
      },
      night: {
        min: 2,
        max: 16,
      },
    },
    pressure: {
      min: 760,
      max: 780,
    },
  },
  FOGGY: {
    clouds: {
      values: [-1, -0.8, -0.5, 0.1, 0, 0.4, 0.8, 1],
      weights: [0, 0, 0, 0, 0, 1, 1, 1],
    },
    windSpeed: {
      values: [0, 1, 2, 3, 4],
      weights: [1, 2, 1, 0, 0],
    },
    windDirection: {
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      weights: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    windGustiness: {
      min: 0,
      max: 0.5,
    },
    rain: {
      values: [1, 2, 3, 4, 5],
      weights: [0, 3, 2, 1, 0],
    },
    rainIntensity: {
      min: 0.3,
      max: 1,
    },
    fog: {
      values: [0.0013, 0.0018, 0.015, 0.02, 0.025],
      weights: [0, 0, 2, 3, 2],
    },
    temp: {
      day: {
        min: 9,
        max: 32,
      },
      night: {
        min: 2,
        max: 16,
      },
    },
    pressure: {
      min: 760,
      max: 780,
    },
  },
  WINDY: {
    clouds: {
      values: [-1, -0.8, -0.5, 0.1, 0, 0.4, 0.8, 1],
      weights: [15, 15, 15, 15, 22, 80, 22, 22],
    },
    windSpeed: {
      values: [0, 1, 2, 3, 4],
      weights: [0, 0, 0, 1, 2],
    },
    windDirection: {
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      weights: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    windGustiness: {
      min: 0.9,
      max: 1,
    },
    rain: {
      values: [1, 2, 3, 4, 5],
      weights: [1, 1, 0, 0, 0],
    },
    rainIntensity: {
      min: 0,
      max: 0.2,
    },
    fog: {
      values: [0.0015, 0.002, 0.008, 0.01, 0.03],
      weights: [2, 1, 0, 0, 0],
    },
    temp: {
      day: {
        min: 9,
        max: 32,
      },
      night: {
        min: 2,
        max: 16,
      },
    },
    pressure: {
      min: 760,
      max: 780,
    },
  },
  MISTY: {
    clouds: {
      values: [-1, -0.8, -0.5, 0.1, 0, 0.15, 0.4, 1],
      weights: [0, 0, 0, 0, 0, 5, 10, 5],
    },
    windSpeed: {
      values: [0, 1, 2, 3, 4],
      weights: [1, 8, 4, 4, 2],
    },
    windDirection: {
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      weights: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    windGustiness: {
      min: 0,
      max: 0.5,
    },
    rain: {
      values: [1, 2, 3, 4, 5],
      weights: [0, 15, 10, 0, 0],
    },
    rainIntensity: {
      min: 0,
      max: 1,
    },
    fog: {
      values: [0.0013, 0.0018, 0.002, 0.004, 0.006],
      weights: [5, 8, 12, 16, 8],
    },
    temp: {
      day: {
        min: 9,
        max: 32,
      },
      night: {
        min: 2,
        max: 16,
      },
    },
    pressure: {
      min: 760,
      max: 780,
    },
  },
  SUNNY: {
    clouds: {
      values: [-1, -0.8, -0.5, 0.1, 0, 0.4, 0.8, 1],
      weights: [15, 15, 15, 0, 0, 0, 0, 0],
    },
    windSpeed: {
      values: [0, 1, 2, 3, 4],
      weights: [14, 10, 5, 0, 0],
    },
    windDirection: {
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      weights: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    windGustiness: {
      min: 0,
      max: 1,
    },
    rain: {
      values: [1, 2, 3, 4, 5],
      weights: [1, 0, 0, 0, 0],
    },
    rainIntensity: {
      min: 0,
      max: 1,
    },
    fog: {
      values: [0.0015, 0.002, 0.008, 0.01, 0.03],
      weights: [2, 1, 0, 0, 0],
    },
    temp: {
      day: {
        min: 9,
        max: 32,
      },
      night: {
        min: 2,
        max: 16,
      },
    },
    pressure: {
      min: 760,
      max: 780,
    },
  },
};
