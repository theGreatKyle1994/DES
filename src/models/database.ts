export interface SeasonDB {
    name: string;
    length: number;
    raidsRemaining: number;
}

export interface WeatherDB {
    name: string;
    length: number;
    raidsRemaining: number;
}

export interface Database {
    season: SeasonDB;
    weather: WeatherDB;
}
