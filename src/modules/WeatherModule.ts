// Configs
import modConfig from "../../config/config.json";
import localDB from "../../config/db/database.json";

// General
import type { Database, DBEntry } from "../models/database";
import type {
    WeatherWeightsConfig,
    WeatherCustomConfig,
} from "../models/weather";
import {
    writeDatabase,
    chooseWeight,
    loadConfig,
    loadConfigs,
    loadWeights,
} from "../utilities/utils";

// SPT
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type {
    ISeasonalValues,
    IWeatherConfig,
} from "@spt/models/spt/config/IWeatherConfig";

export default class WeatherModule {
    private _logger: ILogger;
    private _dbWeather: DBEntry = localDB.weather;
    private _dbSeason: DBEntry = localDB.season;
    private _weatherConfigs: WeatherCustomConfig[] = [];
    private _weatherTypes: string[] = [];
    private _weatherWeights: WeatherWeightsConfig = {
        SUMMER: {},
        AUTUMN: {},
        WINTER: {},
        SPRING: {},
        AUTUMN_LATE: {},
        SPRING_EARLY: {},
    };

    public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
        this._logger = logger;

        // Setup weather
        modConfig.modules.weather.enable
            ? this.enableWeather(weatherSeasonValues)
            : this._logger.logWithColor(
                  "[DES] Weather is disabled.",
                  LogTextColor.YELLOW
              );
    }

    private enableWeather(weatherValues: IWeatherConfig): void {
        let weatherCount = 0;

        // Load default weather
        this._weatherConfigs = loadConfigs<WeatherCustomConfig>(
            this._logger,
            "weather/default",
            ["weights.json"]
        );

        // Load default weather weights
        this._weatherWeights = loadWeights(this._logger, "weather/default");

        // Grab initial weather count
        weatherCount += this._weatherConfigs.length;
        this._logger.logWithColor(
            `[DES] Loaded ${weatherCount} default weather pattern(s).`,
            LogTextColor.GREEN
        );

        // Load custom weather
        if (modConfig.modules.weather.useCustom) {
            this._weatherConfigs = loadConfigs<WeatherCustomConfig>(
                this._logger,
                "weather/custom",
                ["weights.json", "example.json", "exampleWeights.json"],
                this._weatherConfigs
            );

            // Load custom weather weights
            this._weatherWeights = loadWeights(
                this._logger,
                "weather/custom",
                this._weatherWeights
            );

            // Find difference for custom config length
            weatherCount -= this._weatherConfigs.length;
            this._logger.logWithColor(
                `[DES] Loaded ${Math.abs(
                    weatherCount
                )} custom weather pattern(s).`,
                LogTextColor.GREEN
            );
        }

        // Grab all weather names, default and custom
        for (let { name } of this._weatherConfigs)
            this._weatherTypes.push(name);

        // Set initial weather
        this.setWeather(weatherValues);
        this.logWeatherRemaining();
    }

    public setWeather(weatherValues: IWeatherConfig): void {
        // Check if weather change is needed
        if (this._dbWeather.value <= 0) {
            // Update local season values
            this._dbSeason = loadConfig<Database>(
                this._logger,
                "db/database"
            ).season;

            // Generate random weather choice
            const weatherChoice = chooseWeight(
                this._weatherWeights[this._dbSeason.name]
            );

            // Set local weather database
            this._dbWeather.name = weatherChoice;
            this._dbWeather.value = this._dbWeather.length;

            // Set chosen weather to game database
            weatherValues.weather.seasonValues["default"] =
                this.findWeather(weatherChoice);

            // Write changes to local weatherdb
            writeDatabase(this._dbWeather, "weather", this._logger);
            this.logWeatherChange();
        } else {
            // Enforce current values
            weatherValues.weather.seasonValues.default = this.findWeather(
                this._dbWeather.name
            );
            this.logWeather();
        }
    }

    private findWeather(target: string): ISeasonalValues {
        for (let i = 0; i < this._weatherConfigs.length; i++)
            if (this._weatherConfigs[i].name === target)
                return this._weatherConfigs[i].weather;
    }

    public decrementWeather(weatherValues: IWeatherConfig): void {
        // Confirm weatherdb has more raids left
        if (this._dbWeather.value > 0) {
            this._dbWeather.value--;
            this.logWeatherRemaining();
            writeDatabase(this._dbWeather, "weather", this._logger);
            // Or set new weather data
        } else this.setWeather(weatherValues);
    }

    public logWeather(): void {
        modConfig.log.current &&
            this._logger.logWithColor(
                `[DES] Weather is: ${this._dbWeather.name}`,
                LogTextColor.CYAN
            );
    }

    private logWeatherChange(): void {
        modConfig.log.onChange &&
            this._logger.logWithColor(
                `[DES] The weather changed to: ${this._dbWeather.name}`,
                LogTextColor.BLUE
            );
    }

    private logWeatherRemaining(): void {
        modConfig.log.value &&
            this._logger.logWithColor(
                `[DES] ${this._dbWeather.value} raid(s) left for ${this._dbWeather.name}`,
                LogTextColor.CYAN
            );
    }
}
