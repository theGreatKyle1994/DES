// Configs
import modConfig from "../../config/config.json";
import localDB from "../../config/db/database.json";
import seasonWeights from "../../config/season/weights.json";

// General
import type { DBEntry } from "../models/database";
import { seasonDates, SeasonName, seasonOrder } from "../models/seasons";
import { writeDatabase, chooseWeight } from "../utilities/utils";

// SPT
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import { Season } from "@spt/models/enums/Season";

export default class SeasonModule {
    private _logger: ILogger;
    private _seasonDB: DBEntry = localDB.season;

    public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
        this._logger = logger;

        // Setup season
        if (modConfig.modules.seasons.enable)
            this.enableSeasons(weatherSeasonValues);
        else this._logger.log("[DES] Season is disabled.", LogTextColor.YELLOW);
    }

    private enableSeasons(seasonValues: IWeatherConfig): void {
        // Setup season dates to allow any season
        seasonValues.seasonDates = seasonDates;

        // Set initial season if calendar is disabled
        if (!modConfig.modules.calendar.enable) {
            this.setSeason(seasonValues);
            modConfig.log.value &&
                this._logger.logWithColor(
                    `[DES] ${this._seasonDB.value} raid(s) left for ${this._seasonDB.name}`,
                    LogTextColor.CYAN
                );
        }
    }

    public setSeason(seasonValues: IWeatherConfig) {
        // Check if season change is needed
        if (this._seasonDB.value <= 0) {
            let seasonChoice: string = "";

            // Use random seasons
            if (modConfig.modules.seasons.useRandom)
                seasonChoice = chooseWeight(seasonWeights);
            // Determine next season in queue
            else {
                const seasonIndex: number = seasonOrder.indexOf(
                    this._seasonDB.name as keyof typeof SeasonName
                );
                if (seasonIndex === seasonOrder.length - 1)
                    seasonChoice = seasonOrder[0] as SeasonName;
                else seasonChoice = seasonOrder[seasonIndex + 1] as SeasonName;
            }

            // Set local season database
            this._seasonDB.name = SeasonName[seasonChoice];
            this._seasonDB.value = this._seasonDB.length;

            // Set chosen season to game database
            seasonValues.overrideSeason = Season[this._seasonDB.name];
            modConfig.log.onChange &&
                this._logger.log(
                    `[DES] The season changed to: ${this._seasonDB.name}`,
                    LogTextColor.BLUE
                );

            writeDatabase(this._seasonDB, "season", this._logger);
        } else {
            // Enforce current values
            seasonValues.overrideSeason = Season[this._seasonDB.name];
            modConfig.log.current &&
                this._logger.log(
                    `[DES] Season is: ${this._seasonDB.name}`,
                    LogTextColor.CYAN
                );
        }
    }

    public getSeason(): keyof typeof SeasonName {
        return this._seasonDB.name as keyof typeof SeasonName;
    }

    public forceSeason(seasonName: keyof typeof SeasonName): void {
        this._seasonDB.name = seasonName;

        modConfig.log.onChange &&
            this._logger.log(
                `[DES] The season changed to: ${this._seasonDB.name}`,
                LogTextColor.BLUE
            );

        writeDatabase(this._seasonDB, "season", this._logger);
    }

    public decrementSeason(seasonValues: IWeatherConfig): void {
        // Confirm seasondb has more raids left
        if (this._seasonDB.value > 0) {
            this._seasonDB.value--;
            modConfig.log.value &&
                this._logger.logWithColor(
                    `[DES] ${this._seasonDB.value} raid(s) left for ${this._seasonDB.name}`,
                    LogTextColor.CYAN
                );
        } else this.setSeason(seasonValues);

        writeDatabase(this._seasonDB, "season", this._logger);
    }
}
