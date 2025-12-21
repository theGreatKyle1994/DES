// General
import type { TimeStampEntry } from "./mod";

export enum CalendarName {
    JAN = "JAN",
    FEB = "FEB",
    MAR = "MAR",
    APR = "APR",
    MAY = "MAY",
    JUN = "JUN",
    JUL = "JUL",
    AUG = "AUG",
    SEP = "SEP",
    OCT = "OCT",
    NOV = "NOV",
    DEC = "DEC",
}

export const calendarOrder: string[] = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
];

export interface SeasonLayoutEntry {
    month: TimeStampEntry;
    day: TimeStampEntry;
}

export interface SeasonLayouts {
    SUMMER: SeasonLayoutEntry;
    AUTUMN: SeasonLayoutEntry;
    WINTER: SeasonLayoutEntry;
    SPRING: SeasonLayoutEntry;
    AUTUMN_LATE: SeasonLayoutEntry;
    SPRING_EARLY: SeasonLayoutEntry;
}
