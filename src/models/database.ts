export interface DBEntry {
    name: string;
    length: number;
    value: number;
}

export interface Database {
    season: DBEntry;
    weather: DBEntry;
    calendar: DBEntry;
}
