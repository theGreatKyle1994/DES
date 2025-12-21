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

    get season(): keyof typeof SeasonName {
        return this._seasonDB.name as keyof typeof SeasonName;
    }

    public enable(weatherSeasonValues: IWeatherConfig, logger: ILogger): void {
        this._logger = logger;

        // Setup season
        modConfig.modules.seasons.enable
            ? this.enableSeasons(weatherSeasonValues)
            : this._logger.logWithColor(
                  "[DES] Season is disabled.",
                  LogTextColor.YELLOW
              );
    }

    private enableSeasons(seasonValues: IWeatherConfig): void {
        // Setup season dates to allow any season
        seasonValues.seasonDates = seasonDates;

        // Set initial season if calendar is disabled
        if (!modConfig.modules.calendar.enable) {
            this.setSeason(seasonValues);
            this.logSeasonRemaining();
        }
    }

    public setSeason(seasonValues: IWeatherConfig): void {
        // Check if season change is needed
        if (this._seasonDB.value <= 0) {
            let seasonChoice = "";

            // Use random seasons
            if (modConfig.modules.seasons.useRandom)
                seasonChoice = chooseWeight(seasonWeights);
            //  Or determine next season in queue
            else {
                const seasonIndex: number = seasonOrder.indexOf(this.season);
                if (seasonIndex === seasonOrder.length - 1)
                    seasonChoice = seasonOrder[0];
                else seasonChoice = seasonOrder[seasonIndex + 1];
            }

            // Set local season database
            this._seasonDB.name = SeasonName[seasonChoice];
            this._seasonDB.value = this._seasonDB.length;

            // Set chosen season to game database
            seasonValues.overrideSeason = Season[this.season];

            writeDatabase(this._seasonDB, "season", this._logger);
            this.logSeasonChange();
        } else {
            // Enforce current values
            seasonValues.overrideSeason = Season[this.season];
            this.logSeason();
        }
    }

    public forceSeason(seasonName: keyof typeof SeasonName): void {
        // Manually set season to bypass internal system
        this._seasonDB.name = seasonName;
        writeDatabase(this._seasonDB, "season", this._logger);
        this.logSeasonChange();
    }

    public calcNewSeason(): void {
        // Find next season in list
        const newSeason =
            seasonOrder.indexOf(this.season) === seasonOrder.length - 1
                ? seasonOrder[0]
                : seasonOrder[seasonOrder.indexOf(this.season) + 1];
        this.forceSeason(newSeason);
    }

    public decrementSeason(seasonValues: IWeatherConfig): void {
        // Confirm seasondb has more raids left
        if (this._seasonDB.value > 0) {
            this._seasonDB.value--;
            this.logSeasonRemaining();
            writeDatabase(this._seasonDB, "season", this._logger);
            // Or set new season data
        } else this.setSeason(seasonValues);
    }

    public logSeason(): void {
        modConfig.log.current &&
            this._logger.logWithColor(
                `[DES] Season is: ${this.season}`,
                LogTextColor.CYAN
            );
    }

    private logSeasonChange(): void {
        modConfig.log.onChange &&
            this._logger.logWithColor(
                `[DES] The season changed to: ${this.season}`,
                LogTextColor.BLUE
            );
    }

    private logSeasonRemaining(): void {
        modConfig.log.value &&
            this._logger.logWithColor(
                `[DES] ${this._seasonDB.value} raid(s) left for ${this.season}`,
                LogTextColor.CYAN
            );
    }
}
