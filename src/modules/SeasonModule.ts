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
    private _logger: ILogger;
    private _dbSeason = dbSeasonConfig as SeasonDB;

    public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
        this._logger = logger;

        // Setup season
        if (modConfig.modules.seasons.enable)
            this.enableSeasons(weatherSeasonValues);
        else this._logger.log("[TWS] Season is disabled.", LogTextColor.YELLOW);
    }

    private enableSeasons(seasonValues: IWeatherConfig): void {
        // Setup season dates to allow any season
        seasonValues.seasonDates = seasonDates;

        // Set initial season
        this.setSeason(seasonValues);
        this._logger.logWithColor(
            `[TWS] ${this._dbSeason.seasonLeft} raid(s) left for ${this._dbSeason.seasonName}`,
            LogTextColor.CYAN
        );
    }

    public setSeason(seasonValues: IWeatherConfig) {
        // Check if season change is needed
        if (this._dbSeason.seasonLeft <= 0) {
            let seasonChoice: string = "";

            // Use random seasons
            if (modConfig.modules.seasons.useRandom)
                seasonChoice = chooseWeight(seasonWeights);
            // Determine next season in queue
            else {
                const seasonIndex: number = seasonOrder.indexOf(
                    this._dbSeason.seasonName
                );
                if (seasonIndex === seasonOrder.length - 1)
                    seasonChoice = seasonOrder[0] as SeasonName;
                else seasonChoice = seasonOrder[seasonIndex + 1] as SeasonName;
            }

            // Set local season database
            this._dbSeason.seasonName = SeasonName[seasonChoice];
            this._dbSeason.seasonLeft = this._dbSeason.seasonLength;

            // Set chosen season to game database
            seasonValues.overrideSeason = Season[this._dbSeason.seasonName];
            this._logger.log(
                `[TWS] The season changed to: ${this._dbSeason.seasonName}`,
                LogTextColor.BLUE
            );

            writeConfig(this._dbSeason, "season", this._logger);
        } else {
            // Enforce current values
            seasonValues.overrideSeason = Season[this._dbSeason.seasonName];

            this._logger.log(
                `[TWS] Season is: ${this._dbSeason.seasonName}`,
                LogTextColor.CYAN
            );
        }
    }

    public decrementSeason(seasonValues: IWeatherConfig): void {
        // Confirm seasondb has more raids left
        if (this._dbSeason.seasonLeft > 0) {
            this._dbSeason.seasonLeft--;
            this._logger.logWithColor(
                `[TWS] ${this._dbSeason.seasonLeft} raid(s) left for ${this._dbSeason.seasonName}`,
                LogTextColor.CYAN
            );
        } else this.setSeason(seasonValues);

        writeConfig(this._dbSeason, "season", this._logger);
    }
}
