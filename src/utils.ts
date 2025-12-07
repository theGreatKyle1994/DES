// Configs
import modConfig from "../config/config.json";
import dbWeatherConfig from "./db/weather.json";
import dbSeasonConfig from "./db/season.json";
import weightsConfig from "../config/weightsConfig.json";

// General Imports
import { seasonDates } from "./models/seasons";
import { weatherLayouts } from "./models/weather";

// SPT Imports
import { Season } from "@spt/models/enums/Season";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";

class Utils {
  public dbWeather: typeof dbWeatherConfig = dbWeatherConfig;
  public dbSeason: typeof dbSeasonConfig = dbSeasonConfig;
  public logger: ILogger;

  public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
    this.logger = logger;
    this.logger.log(`[TWS] Loading...`, LogTextColor.GREEN);

    if (modConfig.enableSeasons) {
      this.logger.log(
        `[TWS] Season is: ${this.dbSeason.seasonName}`,
        LogTextColor.CYAN
      );
    } else {
      this.logger.log("[TWS] Season is disabled.", LogTextColor.YELLOW);
    }

    if (modConfig.enableWeather) {
      this.logger.log(
        `[TWS] Weather is: ${this.dbWeather.weatherName}`,
        LogTextColor.CYAN
      );
    } else {
      this.logger.log("[TWS] Weather is disabled.", LogTextColor.YELLOW);
    }
    weatherSeasonValues = {
      ...weatherSeasonValues,
      seasonDates: seasonDates,
      overrideSeason: this.dbSeason.seasonType,
      weather: {
        ...weatherSeasonValues.weather,
        seasonValues: {
          ...weatherSeasonValues.weather.seasonValues,
          default: weatherLayouts[this.dbWeather.weatherName],
        },
      },
    };

    this.logger.log(`[TWS] Loading finished!`, LogTextColor.GREEN);
  }

  public setSeason = (seasonValues: IWeatherConfig) => {
    seasonValues.overrideSeason = this.dbSeason.seasonType;
  };

  public setWeather = (weatherValues: IWeatherConfig) => {
    const weatherChoice = this.getRandomWeather();

    weatherValues.weather.seasonValues["default"] =
      weatherLayouts[weatherChoice];

    this.logger.log(
      `[TWS] The weather changed to: ${weatherChoice}`,
      LogTextColor.BLUE
    );
  };

  public getRandomWeather(): string {
    const seasonWeights: typeof weightsConfig.weatherWeights =
      weightsConfig.weatherWeights[this.dbSeason.seasonName];

    let totalWeight = 0;
    for (let key in seasonWeights) {
      totalWeight += seasonWeights[key];
    }

    const cursor = Math.ceil(Math.random() * totalWeight);
    let total = 0;
    for (let key in seasonWeights) {
      total += seasonWeights[key];
      if (total >= cursor) {
        return key;
      }
    }
  }
}

export default Utils;
