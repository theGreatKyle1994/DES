export interface ModConfig {
  enable: boolean;
  enableSeasons: boolean;
  enableWeather: boolean;
  useSeasonLength: boolean;
  useWeatherLength: boolean;
  randomSeasons: boolean;
}

export const modConfigDefaults: ModConfig = {
  enable: true,
  enableSeasons: true,
  enableWeather: true,
  useSeasonLength: true,
  useWeatherLength: true,
  randomSeasons: false,
};
