// Configs
import modConfig from "../../config/config.json";
import localDB from "../../config/db/database.json";

// General
import type { Database, SeasonDB, WeatherDB } from "../models/database";
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
    private _dbWeather: WeatherDB = localDB.weather;
    private _dbSeason: SeasonDB = localDB.season;
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
        if (modConfig.modules.weather.enable)
            this.enableWeather(weatherSeasonValues);
        else
            this._logger.log("[TWS] Weather is disabled.", LogTextColor.YELLOW);
    }

    private async enableWeather(weatherValues: IWeatherConfig): Promise<void> {
        let weatherCount: number = 0;

        // Load default weather
        this._weatherConfigs = await loadConfigs<WeatherCustomConfig>(
            this._logger,
            "weather/default",
            ["weights.json"]
        );

        // Load default weather weights
        this._weatherWeights = await loadWeights(
            this._logger,
            "weather/default"
        );

        // Grab initial weather count
        weatherCount += this._weatherConfigs.length;

        this._logger.logWithColor(
            `[TWS] Loaded ${weatherCount} default weather pattern(s).`,
            LogTextColor.CYAN
        );

        // Load custom weather
        if (modConfig.modules.weather.useCustom) {
            this._weatherConfigs = await loadConfigs<WeatherCustomConfig>(
                this._logger,
                "weather/custom",
                ["weights.json", "example.json", "exampleWeights.json"],
                this._weatherConfigs
            );

            // Load custom weather weights
            this._weatherWeights = await loadWeights(
                this._logger,
                "weather/custom",
                this._weatherWeights
            );

            // Find difference for custom config length
            weatherCount -= this._weatherConfigs.length;

            this._logger.logWithColor(
                `[TWS] Loaded ${Math.abs(
                    weatherCount
                )} custom weather pattern(s).`,
                LogTextColor.CYAN
            );
        }

        // Grab all weather names, default and custom
        for (let { name } of this._weatherConfigs)
            this._weatherTypes.push(name);

        // Set initial weather
        this.setWeather(weatherValues);
        this._logger.logWithColor(
            `[TWS] ${this._dbWeather.raidsRemaining} raid(s) left for ${this._dbWeather.name}`,
            LogTextColor.CYAN
        );
    }

    public async setWeather(weatherValues: IWeatherConfig): Promise<void> {
        // Check if weather change is needed
        if (this._dbWeather.raidsRemaining <= 0) {
            // Update local season values
            this._dbSeason = (
                await loadConfig<Database>(this._logger, "db/database")
            ).season;

            // Generate random weather choice
            const weatherChoice = chooseWeight(
                this._weatherWeights[this._dbSeason.name]
            );

            // Set local weather database
            this._dbWeather.name = weatherChoice;
            this._dbWeather.raidsRemaining = this._dbWeather.length;

            // Set chosen weather to game database
            weatherValues.weather.seasonValues["default"] =
                this.findWeather(weatherChoice);

            this._logger.log(
                `[TWS] The weather changed to: ${this._dbWeather.name}`,
                LogTextColor.BLUE
            );

            // Write changes to local weatherdb
            writeDatabase(this._dbWeather, "weather", this._logger);
        } else {
            // Enforce current values
            weatherValues.weather.seasonValues.default = this.findWeather(
                this._dbWeather.name
            );

            this._logger.log(
                `[TWS] Weather is: ${this._dbWeather.name}`,
                LogTextColor.CYAN
            );
        }
    }

    private findWeather(target: string): ISeasonalValues {
        for (let i = 0; i < this._weatherConfigs.length; i++)
            if (this._weatherConfigs[i].name === target)
                return this._weatherConfigs[i].weather;
    }

    public decrementWeather(weatherValues: IWeatherConfig): void {
        // Confirm weatherdb has more raids left
        if (this._dbWeather.raidsRemaining > 0) {
            this._dbWeather.raidsRemaining--;
            this._logger.logWithColor(
                `[TWS] ${this._dbWeather.raidsRemaining} raid(s) left for ${this._dbWeather.name}`,
                LogTextColor.CYAN
            );
        } else this.setWeather(weatherValues);

        writeDatabase(this._dbWeather, "weather", this._logger);
    }
}
