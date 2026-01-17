// Configs
import seasonConfig from "../../config/season/seasons.json";

// General
import Module from "./core/Module";
import { seasonDates } from "../models/seasons";
import type { SeasonConfig, SeasonConfigEntry } from "../models/seasons";
import type { Database } from "../models/database";

// SPT
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import type { DependencyContainer } from "tsyringe";

export default class SeasonModule extends Module {
    private seasonValues: IWeatherConfig;
    private readonly seasonConfig: SeasonConfig = seasonConfig;
    private readonly seasonNames: string[] = [];

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    private get season(): number {
        return this.seasonConfig[this.db.season.value].value;
    }

    private get seasonEntry(): SeasonConfigEntry {
        return this.seasonConfig[this.db.season.value];
    }

    public initialize(): void {
        this.seasonValues = this.configServer.getConfig<IWeatherConfig>(
            ConfigTypes.WEATHER,
        );
        this.seasonValues.seasonDates = seasonDates;
        for (let season in this.seasonConfig) this.seasonNames.push(season);
    }

    public enable(): void {
        if (!this.seasonNames.includes(this.db.season.value))
            this.db.season.value = "summer";
        if (this.db.season.name !== this.seasonEntry.name)
            this.db.season.name = this.seasonEntry.name;
        this.seasonValues.overrideSeason = this.season;
        this.update();
    }

    public update(): void {
        if (!this.db.event.season) {
            if (
                !this.Utilities.checkWithinDateRange(
                    this.db.date.day,
                    this.db.date.month,
                    this.seasonEntry.timeFrame,
                )
            ) {
                for (let key in this.seasonConfig) {
                    if (
                        this.Utilities.checkWithinDateRange(
                            this.db.date.day,
                            this.db.date.month,
                            this.seasonConfig[key].timeFrame,
                        )
                    ) {
                        this.db.season.name = this.seasonConfig[key].name;
                        this.db.season.value = key;
                        this.seasonValues.overrideSeason = this.season;
                    }
                }
            }
        } else {
            if (this.seasonNames.includes(this.db.event.season)) {
                this.seasonValues.overrideSeason =
                    this.seasonConfig[this.db.event.season].value;
            } else {
                this.seasonValues.overrideSeason = this.season;
                this.logger.warning(
                    `[DES] Invalid season override found in event: '${this.db.event.name}' value: '${this.db.event.season}'. Using calendar season.`,
                );
            }
        }
    }
}
