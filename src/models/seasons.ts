// SPT Imports
import type { ISeasonDateTimes } from "@spt/models/spt/config/IWeatherConfig";

export interface SeasonDB {
  seasonName: SeasonName;
  seasonLength: number;
  seasonLeft: number;
}

export interface SeasonWeights {
  SUMMER: number;
  AUTUMN: number;
  WINTER: number;
  SPRING: number;
  AUTUMN_LATE: number;
  SPRING_EARLY: number;
}

export enum SeasonName {
  SUMMER = "SUMMER",
  AUTUMN = "AUTUMN",
  WINTER = "WINTER",
  SPRING = "SPRING",
  AUTUMN_LATE = "AUTUMN_LATE",
  SPRING_EARLY = "SPRING_EARLY",
  STORM = "STORM",
}

export const seasonOrder: string[] = [
  "SUMMER",
  "AUTUMN",
  "AUTUMN_LATE",
  "WINTER",
  "SPRING_EARLY",
  "SPRING",
];

export const seasonDBDefaults: SeasonDB = {
  seasonName: SeasonName.SUMMER,
  seasonLength: 14,
  seasonLeft: 14,
};

export const seasonDates: ISeasonDateTimes[] = [
  {
    seasonType: 0,
    name: "SUMMER",
    startDay: 1,
    startMonth: 1,
    endDay: 31,
    endMonth: 12,
  },
  {
    seasonType: 1,
    name: "AUTUMN",
    startDay: 1,
    startMonth: 1,
    endDay: 31,
    endMonth: 12,
  },
  {
    seasonType: 2,
    name: "WINTER",
    startDay: 1,
    startMonth: 1,
    endDay: 31,
    endMonth: 12,
  },
  {
    seasonType: 3,
    name: "SPRING",
    startDay: 1,
    startMonth: 1,
    endDay: 31,
    endMonth: 12,
  },
  {
    seasonType: 4,
    name: "AUTUMN_LATE",
    startDay: 1,
    startMonth: 1,
    endDay: 31,
    endMonth: 12,
  },
  {
    seasonType: 5,
    name: "SPRING_EARLY",
    startDay: 1,
    startMonth: 1,
    endDay: 31,
    endMonth: 12,
  },
  {
    seasonType: 6,
    name: "STORM",
    startDay: 1,
    startMonth: 1,
    endDay: 31,
    endMonth: 12,
  },
];
