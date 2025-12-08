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

  public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
    this.logger = logger;
    this.logger.log(`[TWS] Loading...`, LogTextColor.GREEN);

    // Validate db configs
    checkConfigs(this.dbSeason, this.dbWeather, this.logger);

    // Setup season
    if (modConfig.enableSeasons) {
      // Setup season dates to allow any season
      weatherSeasonValues.seasonDates = seasonDates;
      this.setSeason(weatherSeasonValues);
    } else this.logger.log("[TWS] Season is disabled.", LogTextColor.YELLOW);

    // Setup weather
    if (modConfig.enableWeather) this.setWeather(weatherSeasonValues);
    else this.logger.log("[TWS] Weather is disabled.", LogTextColor.YELLOW);

    this.logger.log(`[TWS] Loading finished!`, LogTextColor.GREEN);
  }

  public setSeason = (seasonValues: IWeatherConfig) => {
    // Check if season change is needed
    if (this.dbSeason.seasonLeft <= 0) {
      const seasonChoice = this.getRandomSeason();

      // Set local season database
      this.dbSeason.seasonName = SeasonName[seasonChoice];
      this.dbSeason.seasonLeft = this.dbSeason.seasonLength;

      // Set chosen season to game database
      seasonValues.overrideSeason = Season[this.dbSeason.seasonName];
      this.logger.log(
        `[TWS] The season changed to: ${this.dbSeason.seasonName}`,
        LogTextColor.BLUE
      );

      writeConfig(this.dbSeason, "season", this.logger);
    } else {
      // Enforce current values
      seasonValues.overrideSeason = Season[this.dbSeason.seasonName];

      this.logger.log(
        `[TWS] Season is: ${this.dbSeason.seasonName}`,
        LogTextColor.CYAN
      );
    }
  };

  public setWeather = (weatherValues: IWeatherConfig) => {
    // Check if weather change is needed
    if (this.dbWeather.weatherLeft <= 0) {
      // Generate random weather choice
      const weatherChoice = this.getRandomWeather();

      // Set local weather database
      this.dbWeather.weatherName = WeatherName[weatherChoice];
      this.dbWeather.weatherLeft = this.dbWeather.weatherLength;

      // Set chosen weather to game database
      weatherValues.weather.seasonValues["default"] =
        weatherLayouts[weatherChoice];

      this.logger.log(
        `[TWS] The weather changed to: ${this.dbWeather.weatherName}`,
        LogTextColor.BLUE
      );
      writeConfig(this.dbWeather, "weather", this.logger);
    } else {
      // Enforce current values
      weatherValues.weather.seasonValues.default =
        weatherLayouts[this.dbWeather.weatherName];

      this.logger.log(
        `[TWS] Weather is: ${this.dbWeather.weatherName}`,
        LogTextColor.CYAN
      );
    }
  };

  public getRandomSeason(): string {
    const seasonWeights: SeasonWeights = weightsConfig.seasonWeights;
    return chooseWeight(seasonWeights);
  }

  public getRandomWeather(): string {
    const weatherWeights: WeatherWeights =
      weightsConfig.weatherWeights[this.dbSeason.seasonName];
    return chooseWeight(weatherWeights);
  }

  public decrementSeason(seasonValues: IWeatherConfig): void {
    if (this.dbSeason.seasonLeft > 0) {
      this.dbSeason.seasonLeft--;
      this.logger.logWithColor(
        `[TWS] ${this.dbSeason.seasonLeft} raids left for ${this.dbSeason.seasonName}`,
        LogTextColor.CYAN
      );
    } else this.setSeason(seasonValues);

    writeConfig(this.dbSeason, "season", this.logger);
  }

  public decrementWeather(weatherValues: IWeatherConfig): void {
    if (this.dbWeather.weatherLeft > 0) {
      this.dbWeather.weatherLeft--;
      this.logger.logWithColor(
        `[TWS] ${this.dbWeather.weatherLeft} raids left for ${this.dbWeather.weatherName}`,
        LogTextColor.CYAN
      );
    } else this.setSeason(weatherValues);

    writeConfig(this.dbWeather, "weather", this.logger);
  }
}

export default WeatherSystem;
