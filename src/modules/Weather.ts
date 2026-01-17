// Configs
import weatherConfig from "../../config/season/weather.json";
import seasonConfig from "../../config/season/seasons.json";

// General
import Module from "./core/Module";
import type { Database } from "../models/database";
import type { WeatherConfig, WeatherConfigEntry } from "../models/weather";
import type { SeasonConfig } from "../models/seasons";

// SPT
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import type { ISeasonalValues } from "@spt/models/spt/config/IWeatherConfig";
import type { DependencyContainer } from "tsyringe";

export default class WeatherModule extends Module {
    private weatherValues: IWeatherConfig;
    private readonly weatherConfig: WeatherConfig = weatherConfig;
    private readonly seasonConfig: SeasonConfig = seasonConfig;
    private readonly weatherNames: string[] = [];

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    private get weather(): ISeasonalValues {
        return this.weatherConfig[this.db.weather.value].weather;
    }

    private get weatherWeights(): Record<string, number> {
        return this.seasonConfig[this.db.season.value].weather;
    }

    private get weatherEntry(): WeatherConfigEntry {
        return this.weatherConfig[this.db.weather.value];
    }

    public initialize(): void {
        this.weatherValues = this.configServer.getConfig<IWeatherConfig>(
            ConfigTypes.WEATHER,
        );
        this.weatherValues.weather.generateWeatherAmountHours = 5;
        for (let weather in this.weatherConfig) this.weatherNames.push(weather);
    }

    public enable(): void {
        if (!this.weatherNames.includes(this.db.weather.value))
            this.db.weather.value = "sunny";
        if (this.db.weather.name !== this.weatherEntry.name)
            this.db.weather.name = this.weatherEntry.name;
        this.applyWeather();
        this.update();
    }

    public update(): void {
        if (!this.db.event.weather) {
            const weights: Record<string, number> = {};
            for (let key in this.weatherWeights)
                weights[key] = this.weatherWeights[key];
            const weatherChoice: string = this.Utilities.chooseWeight(weights);
            this.db.weather.value = weatherChoice;
            this.db.weather.name =
                this.weatherConfig[this.db.weather.value].name;
            this.applyWeather(this.weatherConfig[weatherChoice].weather);
        } else {
            if (this.weatherNames.includes(this.db.event.weather)) {
                this.applyWeather(
                    this.weatherConfig[this.db.event.weather].weather,
                );
            } else {
                this.applyWeather(this.weather);
                this.logger.warning(
                    `[DES] Invalid weather override found in event: '${this.db.event.name}' value: '${this.db.event.weather}'. Using season weather.`,
                );
            }
        }
    }

    private applyWeather(
        weather: ISeasonalValues = this.weatherEntry.weather,
    ): void {
        this.weatherValues.weather.timePeriod = {
            values: [this.weatherEntry.changeInterval],
            weights: [1],
        };
        for (let key in this.weatherValues.weather.seasonValues)
            this.weatherValues.weather.seasonValues[key] = weather;
    }
}
