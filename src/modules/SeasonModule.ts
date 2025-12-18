// Configs
import modConfig from "../../config/config.json";
import localDB from "../../config/db/database.json";
import seasonWeights from "../../config/season/weights.json";

// General Imports
import type { SeasonDB } from "../models/database";
import { seasonDates, SeasonName, seasonOrder } from "../models/seasons";
import { writeDatabase, chooseWeight } from "../utilities/utils";

// SPT Imports
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import { Season } from "@spt/models/enums/Season";

export default class SeasonModule {
    private _logger: ILogger;
    private _seasonDB: SeasonDB = localDB.season;

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
            `[TWS] ${this._seasonDB.raidsRemaining} raid(s) left for ${this._seasonDB.name}`,
            LogTextColor.CYAN
        );
    }

    public setSeason(seasonValues: IWeatherConfig) {
        // Check if season change is needed
        if (this._seasonDB.raidsRemaining <= 0) {
            let seasonChoice: string = "";

            // Use random seasons
            if (modConfig.modules.seasons.useRandom)
                seasonChoice = chooseWeight(seasonWeights);
            // Determine next season in queue
            else {
                const seasonIndex: number = seasonOrder.indexOf(
                    this._seasonDB.name
                );
                if (seasonIndex === seasonOrder.length - 1)
                    seasonChoice = seasonOrder[0] as SeasonName;
                else seasonChoice = seasonOrder[seasonIndex + 1] as SeasonName;
            }

            // Set local season database
            this._seasonDB.name = SeasonName[seasonChoice];
            this._seasonDB.raidsRemaining = this._seasonDB.length;

            // Set chosen season to game database
            seasonValues.overrideSeason = Season[this._seasonDB.name];
            this._logger.log(
                `[TWS] The season changed to: ${this._seasonDB.name}`,
                LogTextColor.BLUE
            );

            writeDatabase(this._seasonDB, "season", this._logger);
        } else {
            // Enforce current values
            seasonValues.overrideSeason = Season[this._seasonDB.name];

            this._logger.log(
                `[TWS] Season is: ${this._seasonDB.name}`,
                LogTextColor.CYAN
            );
        }
    }

    public decrementSeason(seasonValues: IWeatherConfig): void {
        // Confirm seasondb has more raids left
        if (this._seasonDB.raidsRemaining > 0) {
            this._seasonDB.raidsRemaining--;
            this._logger.logWithColor(
                `[TWS] ${this._seasonDB.raidsRemaining} raid(s) left for ${this._seasonDB.name}`,
                LogTextColor.CYAN
            );
        } else this.setSeason(seasonValues);

        writeDatabase(this._seasonDB, "season", this._logger);
    }
}
