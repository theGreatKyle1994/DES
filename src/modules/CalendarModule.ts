// Configs
import modConfig from "../../config/config.json";
import localDB from "../../config/db/database.json";
import seasonLayouts from "../../config/calendar/seasonLayouts.json";

// General
import SeasonModule from "./SeasonModule";
import type { DBEntry } from "../models/database";
import {
    CalendarName,
    calendarOrder,
    type SeasonLayoutEntry,
    type SeasonLayouts,
} from "../models/calendar";
import { writeDatabase } from "../utilities/utils";

// SPT
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { SeasonName, seasonOrder } from "../models/seasons";

export default class CalendarModule {
    private _logger: ILogger;
    private _layouts: SeasonLayouts = seasonLayouts;
    private _calendarDB: DBEntry = localDB.calendar;
    private _SeasonModule: SeasonModule;

    public enable(SeasonModule: SeasonModule, logger: ILogger): void {
        this._logger = logger;
        this._SeasonModule = SeasonModule;

        // Setup calendar
        if (modConfig.modules.calendar.enable) this.enableCalendar();
        else
            this._logger.log(
                "[DES] Calendar is disabled.",
                LogTextColor.YELLOW
            );
    }

    private enableCalendar(): void {
        // Setup calendar if seasons are enabled
        if (modConfig.modules.seasons.enable) this.setCalendar();
        else
            this._logger.log(
                "[DES] Seasons are disabled. They must be enabled to use the calendar module.",
                LogTextColor.YELLOW
            );
    }

    public setCalendar(): void {
        // Check if calendar change is needed
        if (this._calendarDB.value > this._calendarDB.length) {
            let monthChoice = "";

            // Determine next month in queue
            const calendarIndex = calendarOrder.indexOf(this._calendarDB.name);

            if (calendarIndex === calendarOrder.length - 1)
                monthChoice = calendarOrder[0];
            else monthChoice = calendarOrder[calendarIndex + 1];

            // Force season change to bypass season system
            this._SeasonModule.forceSeason(
                this.checkSeasonChange(this._SeasonModule.getSeason())
            );

            // Set local calendar database
            this._calendarDB.name = CalendarName[monthChoice];
            this._calendarDB.value = 1;

            modConfig.log.onChange &&
                this._logger.logWithColor(
                    `[DES] Date change to: ${this._calendarDB.name} - ${this._calendarDB.value}.`,
                    LogTextColor.CYAN
                );

            // Write changes to local db
            writeDatabase(this._calendarDB, "calendar", this._logger);
        } else {
            modConfig.log.current &&
                this._logger.logWithColor(
                    `[DES] Date is: ${this._calendarDB.name} - ${this._calendarDB.value}.`,
                    LogTextColor.CYAN
                );
            modConfig.log.current &&
                this._logger.log(
                    `[DES] Season is: ${this._SeasonModule.getSeason()}`,
                    LogTextColor.CYAN
                );
        }
    }

    private checkSeasonChange(
        currentSeason: keyof typeof SeasonName
    ): keyof typeof SeasonName {
        // Grab current season layout
        const season: SeasonLayoutEntry = this._layouts[currentSeason];

        // Validate season timeframes
        const monthIndex = calendarOrder.indexOf(this._calendarDB.name);
        const monthOffset =
            season.month.start + season.month.end - (monthIndex + 1);

        // Determine if current month falls inside season range
        if (
            monthOffset >= season.month.start ||
            monthOffset <= season.month.end
        ) {
            // Determine if current month is last month of the season
            if (monthIndex + 1 === season.month.end) {
                // Check if current day falls inside season range
                if (
                    this._calendarDB.value >= season.day.start &&
                    this._calendarDB.value <= season.day.end
                ) {
                    return currentSeason;
                }
                // Get new season values
                else {
                    let newSeason = currentSeason;
                    // Find new season index
                    if (
                        seasonOrder.indexOf(currentSeason) ===
                        seasonOrder.length - 1
                    ) {
                        newSeason = seasonOrder[0];
                    } else {
                        newSeason =
                            seasonOrder[seasonOrder.indexOf(currentSeason) + 1];
                    }
                    // Return season change
                    return newSeason;
                }
            }
        }
        return currentSeason;
    }

    public incrementCalendar(): void {
        // Confirm calendardb has more raids left
        if (this._calendarDB.value < this._calendarDB.length) {
            this._calendarDB.value++;
            modConfig.log.value &&
                this._logger.logWithColor(
                    `[DES] Date is: ${this._calendarDB.name}/${this._calendarDB.value}.`,
                    LogTextColor.CYAN
                );
        } else this.setCalendar();

        writeDatabase(this._calendarDB, "calendar", this._logger);
    }
}
