// Configs
import modConfig from "../../config/config.json";
import dbSeasonConfig from "../../config/db/season.json";
import seasonWeights from "../../config/season/weights.json";

// General Imports
import { seasonDates, SeasonName, seasonOrder } from "../models/seasons";
import type { SeasonDB } from "../models/seasons";
import { writeConfig, chooseWeight } from "../utilities/utils";

// SPT Imports
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import { Season } from "@spt/models/enums/Season";

export default class SeasonModule {
    public logger: ILogger;
    public dbSeason = dbSeasonConfig as SeasonDB;

    public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
        this.logger = logger;

        // Setup season
        if (modConfig.modules.seasons.enable)
            this.enableSeasons(weatherSeasonValues);
        else this.logger.log("[TWS] Season is disabled.", LogTextColor.YELLOW);
    }

    public enableSeasons(seasonValues: IWeatherConfig): void {
        // Setup season dates to allow any season
        seasonValues.seasonDates = seasonDates;

        // Set initial season
        this.setSeason(seasonValues);
        this.logger.logWithColor(
            `[TWS] ${this.dbSeason.seasonLeft} raid(s) left for ${this.dbSeason.seasonName}`,
            LogTextColor.CYAN
        );
    }

    public setSeason(seasonValues: IWeatherConfig) {
        // Check if season change is needed
        if (this.dbSeason.seasonLeft <= 0) {
            let seasonChoice: string = "";

            // Use random seasons
            if (modConfig.modules.seasons.useRandom)
                seasonChoice = chooseWeight(seasonWeights);
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

    public decrementSeason(seasonValues: IWeatherConfig): void {
        // Confirm seasondb has more raids left
        if (this.dbSeason.seasonLeft > 0) {
            this.dbSeason.seasonLeft--;
            this.logger.logWithColor(
                `[TWS] ${this.dbSeason.seasonLeft} raid(s) left for ${this.dbSeason.seasonName}`,
                LogTextColor.CYAN
            );
        } else this.setSeason(seasonValues);

        writeConfig(this.dbSeason, "season", this.logger);
    }
}
