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

export default class CalendarModule {
    private _logger: ILogger;
    private _layouts: SeasonLayouts = seasonLayouts;
    private _calendarDB: DBEntry = localDB.calendar;
    private _SeasonModule: SeasonModule;

    public enable(SeasonModule: SeasonModule, logger: ILogger): void {
        this._logger = logger;
        this._SeasonModule = SeasonModule;

        // Setup calendar
        if (modConfig.modules.calendar.enable) {
            // Season module is required for calendar functionality
            !modConfig.modules.seasons.enable
                ? this._logger.logWithColor(
                      "[DES] Seasons are disabled. They must be enabled to use the calendar module.",
                      LogTextColor.YELLOW
                  )
                : this.setCalendar();
        } else
            this._logger.logWithColor(
                "[DES] Calendar is disabled.",
                LogTextColor.YELLOW
            );
    }

    public setCalendar(): void {
        // Check if calendar update is needed
        if (this._calendarDB.value > this._calendarDB.length) {
            // Determine next month in queue
            let monthIndex = this.getMonthIndex();
            const monthChoice =
                monthIndex === calendarOrder.length - 1
                    ? calendarOrder[0]
                    : calendarOrder[monthIndex + 1];
            monthIndex = calendarOrder.indexOf(monthChoice);

            // Set local calendar database
            this._calendarDB.name = CalendarName[monthChoice];
            this._calendarDB.value = 1;

            // Write changes to local db
            writeDatabase(this._calendarDB, "calendar", this._logger);
            this.logDateChange();
        } else {
            this._SeasonModule.logSeason();
            this.logDate();
        }
        // Determine if season change is needed
        this.checkSeasonChange();
    }

    public incrementCalendar(): void {
        // Confirm calendardb has more raids left
        if (this._calendarDB.value < this._calendarDB.length) {
            this._calendarDB.value++;
            writeDatabase(this._calendarDB, "calendar", this._logger);
            this.logDate();
        }
        // Determine if season change is needed
        this.setCalendar();
    }

    private checkSeasonChange(): void {
        // Grab current season layout
        const season: SeasonLayoutEntry =
            this._layouts[this._SeasonModule.season];

        // Check month and day range for season update
        (!this.checkMonthRange(season) ||
            (this.isFinalMonth(season) && !this.checkDayRange(season))) &&
            this._SeasonModule.calcNewSeason();
    }

    private checkMonthRange(season: SeasonLayoutEntry): boolean {
        // Validate season timeframes
        const monthIndex = this.getMonthIndex();
        const monthOffset = season.month.start + season.month.end - monthIndex;

        // Determine if current month falls inside season range
        return season.month.start > season.month.end
            ? monthOffset >= season.month.start ||
                  monthOffset <= season.month.end
            : monthOffset >= season.month.start &&
                  monthOffset <= season.month.end;
    }

    private checkDayRange(season: SeasonLayoutEntry): boolean {
        const dayOffset =
            season.day.start + season.day.end - this._calendarDB.value;

        // Check if current day falls inside season range
        return season.day.start > season.day.end
            ? dayOffset >= season.day.start || dayOffset <= season.day.end
            : dayOffset >= season.day.start && dayOffset <= season.day.end;
    }

    private isFinalMonth(season: SeasonLayoutEntry): boolean {
        // Determine if current month is last month of the season
        const monthIndex = this.getMonthIndex();
        return monthIndex === season.month.end;
    }

    private getMonthIndex(): number {
        return calendarOrder.indexOf(this._calendarDB.name) + 1;
    }

    public logDate(): void {
        modConfig.log.value &&
            this._logger.logWithColor(
                `[DES] Date is: ${this._calendarDB.name} - ${this._calendarDB.value}.`,
                LogTextColor.CYAN
            );
    }

    private logDateChange(): void {
        modConfig.log.onChange &&
            this._logger.logWithColor(
                `[DES] Date changed to: ${this._calendarDB.name} - ${this._calendarDB.value}.`,
                LogTextColor.BLUE
            );
    }
}
