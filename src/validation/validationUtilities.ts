// Configs
import weightsConfig from "../../config/weightsConfig.json";

// General Imports
import {
  type WeatherDB,
  weatherDBDefaults,
  WeatherName,
} from "../models/weather";
import { writeConfig } from "../utilities/utils";
import { type SeasonDB, seasonDBDefaults, SeasonName } from "../models/seasons";
import { type ModConfig, modConfigDefaults } from "../models/mod";

// SPT Imports
import type { ILogger } from "@spt/models/spt/utils/ILogger";

export function checkConfigs(
  dbSeason: SeasonDB,
  dbWeather: WeatherDB,
  logger: ILogger
): void {
  checkSeasonDB(dbSeason, logger);
  checkWeatherDB(dbWeather, logger);
}

function checkSeasonDB(dbSeason: SeasonDB, logger: ILogger): void {
  let isError: boolean = false;
  // Check season config for invalid keys
  isError = validateConfigKeys<SeasonDB, typeof seasonDBDefaults>(
    dbSeason,
    seasonDBDefaults,
    "season",
    logger
  );
  // Run config validation checks
  if (!Object.values(SeasonName).includes(dbSeason.seasonName as SeasonName)) {
    isError = true;
    logger.error(
      `[TWS] seasonName: "${dbSeason.seasonName}" is not a valid season type.`
    );
    dbSeason.seasonName = SeasonName.SUMMER;
  }
  if (dbSeason.seasonLength <= 0 || dbSeason.seasonLeft < 0) {
    isError = true;
    logger.error(
      `[TWS] ${
        dbSeason.seasonLength <= 0 ? "seasonLength" : "seasonLeft"
      } must be ${dbSeason.seasonLength <= 0 ? ">" : ">="} 0.`
    );
    dbSeason.seasonLength = weightsConfig.minSeasonDuration;
    dbSeason.seasonLeft = dbSeason.seasonLength;
  } else if (dbSeason.seasonLeft > dbSeason.seasonLength) {
    isError = true;
    logger.error("[TWS] seasonLeft must be <= seasonLength.");
    dbSeason.seasonLeft = dbSeason.seasonLength;
  }
  // Repair config issues
  if (isError) repairConfig<SeasonDB>(dbSeason, "season", logger);
}

function checkWeatherDB(dbWeather: WeatherDB, logger: ILogger): void {
  let isError: boolean = false;
  // Check weather config for invalid keys
  isError = validateConfigKeys<WeatherDB, typeof weatherDBDefaults>(
    dbWeather,
    weatherDBDefaults,
    "weather",
    logger
  );
  // Run config validation checks
  if (
    !Object.values(WeatherName).includes(dbWeather.weatherName as WeatherName)
  ) {
    isError = true;
    logger.error(
      `[TWS] "${dbWeather.weatherName}" is not a valid weather type.`
    );
    dbWeather.weatherName = WeatherName.SUNNY;
  }
  if (dbWeather.weatherLength <= 0 || dbWeather.weatherLeft < 0) {
    isError = true;
    logger.error(
      `[TWS] ${
        dbWeather.weatherLength <= 0 ? "weatherLength" : "weatherLeft"
      } must be ${dbWeather.weatherLength <= 0 ? ">" : ">="} 0.`
    );
    dbWeather.weatherLength = weightsConfig.minWeatherDuration;
    dbWeather.weatherLeft = dbWeather.weatherLength;
  } else if (dbWeather.weatherLeft > dbWeather.weatherLength) {
    isError = true;
    logger.error("[TWS] weatherLeft must be <= weatherLength.");
    dbWeather.weatherLeft = dbWeather.weatherLength;
  }
  // Repair config issues
  if (isError) repairConfig<WeatherDB>(dbWeather, "weather", logger);
}

export function checkModConfig(modConfig: ModConfig, logger: ILogger): void {
  let isError: boolean = false;
  // Check mod config for invalid keys
  isError = validateConfigKeys<ModConfig, typeof modConfigDefaults>(
    modConfig,
    modConfigDefaults,
    "config",
    logger
  );
  // Repair config issues
  if (isError) repairConfig<ModConfig>(modConfig, "config", logger);
}

function validateConfigKeys<ConfigType, ModelType>(
  config: ConfigType,
  model: ModelType,
  fileName: string,
  logger: ILogger
): boolean {
  let isError: boolean = false;
  // Check against model
  for (let key in model) {
    // Replace missing keys
    if (!Object.keys(config).includes(key)) {
      isError = true;
      logger.error(`[TWS] Key: "${key}" is missing in ${fileName}.json.`);
      config[key as string] = model[key];
    }
  }
  // check against config
  for (let key in config) {
    // Delete unknown keys
    if (!Object.hasOwn(model as Object, key)) {
      isError = true;
      logger.error(`[TWS] Invalid key: "${key}" found in ${fileName}.json.`);
      delete config[key];
    }
    // Fix invalid types
    if (typeof model[key as string] !== typeof config[key]) {
      isError = true;
      logger.error(
        `[TWS] Key: "${key}" has an incorrect type of: ${typeof config[key]}.`
      );
      config[key] = model[key as string];
    }
  }
  // Return error status
  return isError;
}

function repairConfig<ConfigType>(
  config: ConfigType,
  fileName: string,
  logger: ILogger
): void {
  logger.warning(`[TWS] Repairing ${fileName}.json...`);
  writeConfig<ConfigType>(config, fileName, logger);
}
