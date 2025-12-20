export interface DBEntry {
    name: string;
    length: number;
    remaining: number;
}

export interface Database {
    season: DBEntry;
    weather: DBEntry;
    calendar: DBEntry;
}

export const databaseDefaults = {
    season: {
        name: "SUMMER",
        length: 14,
        remaining: 14,
    },
    weather: {
        name: "SUNNY",
        length: 3,
        remaining: 3,
    },
    calendar: {
        name: "JUN",
        length: 30,
        remaining: 30,
    },
};
