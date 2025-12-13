// Configs
import modConfig from "../config/config.json";
import dbWeatherConfig from "../config/db/weather.json";
import dbSeasonConfig from "../config/db/season.json";
import weightsConfig from "../config/weightsConfig.json";

// General Imports
import { seasonDates, SeasonName, seasonOrder } from "./models/seasons";
import type { WeatherDB, WeatherConfigPattern } from "./models/weather";
import type { SeasonDB, SeasonWeights } from "./models/seasons";
import { checkConfigs } from "./validation/validationUtilities";
import { writeConfig, chooseWeight, loadConfigs } from "./utilities/utils";

// SPT Imports
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type {
    ISeasonalValues,
    IWeatherConfig,
} from "@spt/models/spt/config/IWeatherConfig";
import { Season } from "@spt/models/enums/Season";

class WeatherSystem {
    public dbWeather = dbWeatherConfig as WeatherDB;
    public dbSeason = dbSeasonConfig as SeasonDB;
    public weatherConfigs: WeatherConfigPattern[] = [];
    public weatherTypes: string[] = [];
    public logger: ILogger;

    public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
        this.logger = logger;
        this.logger.log(`[TWS] Loading...`, LogTextColor.GREEN);

        // Validate db configs
        checkConfigs(this.dbSeason, this.dbWeather, this.logger);

        // Setup season
        if (modConfig.enableSeasons) this.enableSeasons(weatherSeasonValues);
        else this.logger.log("[TWS] Season is disabled.", LogTextColor.YELLOW);

        // Setup weather
        if (modConfig.enableWeather) this.enableWeather(weatherSeasonValues);
        else this.logger.log("[TWS] Weather is disabled.", LogTextColor.YELLOW);

        this.logger.log(`[TWS] Loading finished!`, LogTextColor.GREEN);
    }

    public async enableSeasons(seasonValues: IWeatherConfig) {
        // Setup season dates to allow any season
        seasonValues.seasonDates = seasonDates;

        // Set initial season
        this.setSeason(seasonValues);
        this.logger.logWithColor(
            `[TWS] ${this.dbSeason.seasonLeft} raid(s) left for ${this.dbSeason.seasonName}`,
            LogTextColor.CYAN
        );
    }

    public async enableWeather(weatherValues: IWeatherConfig) {
        // Load default weather configs
        this.weatherConfigs = await loadConfigs<WeatherConfigPattern>(
            "defaultWeather",
            this.logger
        );

        // Grab initial weather count
        let customWeatherLength: number = this.weatherConfigs.length;
        this.logger.logWithColor(
            `[TWS] Loaded ${customWeatherLength} default weather pattern(s).`,
            LogTextColor.CYAN
        );

        // Load custom weather configs
        this.weatherConfigs = await loadConfigs<WeatherConfigPattern>(
            "customWeather",
            this.logger,
            this.weatherConfigs
        );

        // Grab all weather names, default and custom
        for (let { name } of this.weatherConfigs) this.weatherTypes.push(name);

        // Find difference for custom config length
        customWeatherLength -= this.weatherConfigs.length;
        this.logger.logWithColor(
            `[TWS] Loaded ${Math.abs(
                customWeatherLength
            )} custom weather pattern(s).`,
            LogTextColor.CYAN
        );

        // Set initial weather
        this.setWeather(weatherValues);
        this.logger.logWithColor(
            `[TWS] ${this.dbWeather.weatherLeft} raid(s) left for ${this.dbWeather.weatherName}`,
            LogTextColor.CYAN
        );
    }

    public setSeason(seasonValues: IWeatherConfig) {
        // Check if season change is needed
        if (this.dbSeason.seasonLeft <= 0) {
            let seasonChoice: string = "";

            // Use random seasons
            if (modConfig.randomSeasons) seasonChoice = this.getRandomSeason();
            // Determine next season in queue
            else {
                const seasonIndex: number = seasonOrder.indexOf(
                    this.dbSeason.seasonName
                );
                if (seasonIndex === seasonOrder.length - 1)
                    seasonChoice = seasonOrder[0] as SeasonName;
                else seasonChoice = seasonOrder[seasonIndex + 1] as SeasonName;
            }

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
    }

    public setWeather(weatherValues: IWeatherConfig) {
        // Check if weather change is needed
        if (this.dbWeather.weatherLeft <= 0) {
            // Generate random weather choice
            const weatherChoice = this.getRandomWeather();

            // Set local weather database
            this.dbWeather.weatherName = weatherChoice;
            this.dbWeather.weatherLeft = this.dbWeather.weatherLength;

            // Set chosen weather to game database
            weatherValues.weather.seasonValues["default"] =
                this.findWeather(weatherChoice);

            this.logger.log(
                `[TWS] The weather changed to: ${this.dbWeather.weatherName}`,
                LogTextColor.BLUE
            );
            writeConfig(this.dbWeather, "weather", this.logger);
        } else {
            // Enforce current values
            weatherValues.weather.seasonValues.default = this.findWeather(
                this.dbWeather.weatherName
            );

            this.logger.log(
                `[TWS] Weather is: ${this.dbWeather.weatherName}`,
                LogTextColor.CYAN
            );
        }
    }

    public getRandomSeason(): string {
        const seasonWeights: SeasonWeights = weightsConfig.seasonWeights;
        return chooseWeight(seasonWeights);
    }

    public getRandomWeather(): string {
        const weatherWeights =
            weightsConfig.weatherWeights[this.dbSeason.seasonName];
        return chooseWeight(weatherWeights);
    }

    public findWeather(target: string): ISeasonalValues {
        for (let i = 0; i < this.weatherConfigs.length; i++)
            if (this.weatherConfigs[i].name === target)
                return this.weatherConfigs[i].weather;
    }

    public decrementSeason(seasonValues: IWeatherConfig): void {
        // sessionID check to only decrement by 1 instead of for each player
        if (
            this.dbSeason.seasonLeft > 0
            // && modConfig.fikaAdjustmentID === this.fikaID
        ) {
            this.dbSeason.seasonLeft--;
            this.logger.logWithColor(
                `[TWS] ${this.dbSeason.seasonLeft} raid(s) left for ${this.dbSeason.seasonName}`,
                LogTextColor.CYAN
            );
        } else this.setSeason(seasonValues);

        writeConfig(this.dbSeason, "season", this.logger);
    }

    public decrementWeather(weatherValues: IWeatherConfig): void {
        // sessionID check to only decrement by 1 instead of for each player
        if (
            this.dbWeather.weatherLeft > 0
            // && modConfig.fikaAdjustmentID === this.fikaID
        ) {
            this.dbWeather.weatherLeft--;
            this.logger.logWithColor(
                `[TWS] ${this.dbWeather.weatherLeft} raid(s) left for ${this.dbWeather.weatherName}`,
                LogTextColor.CYAN
            );
        } else this.setSeason(weatherValues);

        writeConfig(this.dbWeather, "weather", this.logger);
    }
}

export default WeatherSystem;
