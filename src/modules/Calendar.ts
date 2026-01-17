// General
import Module from "./core/Module";
import { calendarOrder } from "../models/calendar";
import type { Database } from "../models/database";

// SPT
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { DependencyContainer } from "tsyringe";

export default class CalendarModule extends Module {
    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    public enable(): void {
        if (!this.Utilities.inRange(1, 12, this.db.date.month))
            this.db.date.month = 6;
        if (!this.Utilities.inRange(1, 30, this.db.date.day))
            this.db.date.day = 1;
        if (!this.Utilities.inRange(1, 9999, this.db.date.year))
            this.db.date.year = 2010;
        this.setNames();
    }

    public update(): void {
        this.db.date.day++;
        if (this.db.date.day > 30) {
            this.db.date.day = 1;
            this.db.date.month++;
            if (this.db.date.month > 12) {
                this.db.date.month = 1;
                this.db.date.year++;
            }
        }
        this.setNames();
    }

    private getDayName(): string {
        let dayName: string = `${this.db.date.day}`;
        let tempArr = this.db.date.day.toString().split("");
        let digit: string = tempArr[0];
        if (tempArr.length > 1) {
            digit = tempArr[1];
            if (tempArr[0] === "1") {
                dayName += "th";
                return dayName;
            }
        }
        switch (digit) {
            case "1":
                dayName += "st";
                break;
            case "2":
                dayName += "nd";
                break;
            case "3":
                dayName += "rd";
                break;
            default:
                dayName += "th";
        }
        return dayName;
    }

    private getMonthName(): string {
        return this.db.date.month === calendarOrder.length
            ? calendarOrder[calendarOrder.length - 1]
            : calendarOrder[this.db.date.month - 1];
    }

    private setNames(): void {
        this.db.date.name.numeric = `${this.db.date.month}/${this.db.date.day}/${this.db.date.year}`;
        this.db.date.name.alpha = `${this.getMonthName()} ${this.getDayName()}, ${
            this.db.date.year
        }`;
    }
}
