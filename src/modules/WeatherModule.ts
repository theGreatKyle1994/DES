// Configs
import modConfig from "../../config/config.json";
import dbWeatherConfig from "../../config/db/weather.json";
import dbSeasonConfig from "../../config/db/season.json";

// General
import type {
    WeatherDB,
    WeatherWeightsConfig,
    WeatherConfig,
} from "../models/weather";
import type { SeasonDB } from "../models/seasons";
import {
    writeConfig,
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
    private _dbWeather = dbWeatherConfig as WeatherDB;
    private _dbSeason = dbSeasonConfig as SeasonDB;
    private _weatherConfigs: WeatherConfig[] = [];
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
        this._weatherConfigs = await loadConfigs<WeatherConfig>(
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
            this._weatherConfigs = await loadConfigs<WeatherConfig>(
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
            `[TWS] ${this._dbWeather.weatherLeft} raid(s) left for ${this._dbWeather.weatherName}`,
            LogTextColor.CYAN
        );
    }

    public async setWeather(weatherValues: IWeatherConfig): Promise<void> {
        // Check if weather change is needed
        if (this._dbWeather.weatherLeft <= 0) {
            // Update local season values
            this._dbSeason = await loadConfig<SeasonDB>(
                this._logger,
                "db/season"
            );

            // Generate random weather choice
            const weatherChoice = chooseWeight(
                this._weatherWeights[this._dbSeason.seasonName]
            );

            // Set local weather database
            this._dbWeather.weatherName = weatherChoice;
            this._dbWeather.weatherLeft = this._dbWeather.weatherLength;

            // Set chosen weather to game database
            weatherValues.weather.seasonValues["default"] =
                this.findWeather(weatherChoice);

            this._logger.log(
                `[TWS] The weather changed to: ${this._dbWeather.weatherName}`,
                LogTextColor.BLUE
            );

            // Write changes to local weatherdb
            writeConfig(this._dbWeather, "weather", this._logger);
        } else {
            // Enforce current values
            weatherValues.weather.seasonValues.default = this.findWeather(
                this._dbWeather.weatherName
            );

            this._logger.log(
                `[TWS] Weather is: ${this._dbWeather.weatherName}`,
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
        if (this._dbWeather.weatherLeft > 0) {
            this._dbWeather.weatherLeft--;
            this._logger.logWithColor(
                `[TWS] ${this._dbWeather.weatherLeft} raid(s) left for ${this._dbWeather.weatherName}`,
                LogTextColor.CYAN
            );
        } else this.setWeather(weatherValues);

        writeConfig(this._dbWeather, "weather", this._logger);
    }
}
