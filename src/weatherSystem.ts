// Configs
import modConfig from "../config/config.json";
import dbWeatherConfig from "../config/weather.json";
import dbSeasonConfig from "../config/season.json";
import weightsConfig from "../config/weightsConfig.json";

// General Imports
import { seasonDates, SeasonName } from "./models/seasons";
import {
  weatherLayouts,
  WeatherName,
  type WeatherDB,
  type WeatherWeights,
} from "./models/weather";
import type { SeasonDB, SeasonWeights } from "./models/seasons";
import { checkConfigs } from "./validation/validationUtilities";
import { writeConfig, chooseWeight } from "./utilities/utils";

// SPT Imports
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import { Season } from "@spt/models/enums/Season";

class WeatherSystem {
  public dbWeather = dbWeatherConfig as WeatherDB;
  public dbSeason = dbSeasonConfig as SeasonDB;
  public logger: ILogger;

  // Main mod initialization
  public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
    this.logger = logger;
    // Begin loading
    this.logger.log(`[TWS] Loading...`, LogTextColor.GREEN);
    // Validate db configs
    checkConfigs(this.dbSeason, this.dbWeather, this.logger);
    // Check seasons
    if (modConfig.enableSeasons) {
      // Setup game database to initial values from db files
      weatherSeasonValues = {
        ...weatherSeasonValues,
        seasonDates: seasonDates,
        overrideSeason: this.dbSeason.seasonType,
      };
      this.logger.log(
        `[TWS] Season is: ${this.dbSeason.seasonName}`,
        LogTextColor.CYAN
      );
    } else {
      this.logger.log("[TWS] Season is disabled.", LogTextColor.YELLOW);
    }
     // Check weather
    if (modConfig.enableWeather) {
      // Setup game database to initial values from db files
      weatherSeasonValues = {
        ...weatherSeasonValues,
        weather: {
          ...weatherSeasonValues.weather,
          seasonValues: {
            ...weatherSeasonValues.weather.seasonValues,
            default: weatherLayouts[this.dbWeather.weatherName],
          },
        },
      };
      this.logger.log(
        `[TWS] Weather is: ${this.dbWeather.weatherName}`,
        LogTextColor.CYAN
      );
    } else {
      this.logger.log("[TWS] Weather is disabled.", LogTextColor.YELLOW);
    }
    // End loading
    this.logger.log(`[TWS] Loading finished!`, LogTextColor.GREEN);
  }

  public setSeason = (seasonValues: IWeatherConfig) => {
    if (this.dbSeason.seasonLeft <= 0) {
      // debug, need to implement
      const seasonChoice = this.getRandomSeason();
      // Set season database
      this.dbSeason.seasonType = Season[seasonChoice];
      this.dbSeason.seasonName = SeasonName[seasonChoice];
      this.dbSeason.seasonLeft = this.dbSeason.seasonLength;
      // Set chosen season to game database
      seasonValues.overrideSeason = this.dbSeason.seasonType;
      // Check new season choice
      this.logger.log(
        `[TWS] The season changed to: ${seasonValues.overrideSeason}`,
        LogTextColor.BLUE
      );
      // Write changes to local db
      writeConfig(this.dbSeason, "season", this.logger);
    } else {
      seasonValues = {
        ...seasonValues,
        overrideSeason: this.dbSeason.seasonType,
      };
    }
  };

  public setWeather = (weatherValues: IWeatherConfig) => {
    if (this.dbWeather.weatherLeft <= 0) {
      // Generate random weather choice
      const weatherChoice = this.getRandomWeather();
      // Set weather database
      this.dbWeather.weatherName = WeatherName[weatherChoice];
      this.dbWeather.weatherLeft = this.dbWeather.weatherLength;
      // Set chosen weather to game database
      weatherValues.weather.seasonValues["default"] =
        weatherLayouts[weatherChoice];
      // Check new weather choice
      this.logger.log(
        `[TWS] The weather changed to: ${this.dbWeather.weatherName}`,
        LogTextColor.BLUE
      );
      // Write changes to local db
      writeConfig(this.dbWeather, "weather", this.logger);
    } else {
      weatherValues = {
        ...weatherValues,
        weather: {
          ...weatherValues.weather,
          seasonValues: {
            ...weatherValues.weather.seasonValues,
            default: weatherLayouts[this.dbWeather.weatherName],
          },
        },
      };
    }
  };

  public getRandomSeason(): string {
    // Fetch season weights
    const seasonWeights: SeasonWeights = weightsConfig.seasonWeights;
    // Return chosen weight
    return chooseWeight(seasonWeights);
  }

  public getRandomWeather(): string {
    // Fetch weather weights based on current season
    const weatherWeights: WeatherWeights =
      weightsConfig.weatherWeights[this.dbSeason.seasonName];
    // Return chosen weight
    return chooseWeight(weatherWeights);
  }

  public decrementSeason(seasonValues: IWeatherConfig): void {
    if (this.dbSeason.seasonLeft > 0) this.dbSeason.seasonLeft--;
    else this.setSeason(seasonValues);
    writeConfig(this.dbSeason, "season", this.logger);
  }

  public decrementWeather(weatherValues: IWeatherConfig): void {
    if (this.dbWeather.weatherLeft > 0) this.dbWeather.weatherLeft--;
    else this.setSeason(weatherValues);
    writeConfig(this.dbWeather, "weather", this.logger);
  }
}

export default WeatherSystem;
