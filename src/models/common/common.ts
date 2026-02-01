export interface MinMax {
    min?: number;
    max?: number;
}

export type DayNight<T> = Partial<Record<DayNightNames, T>>;

export type DayNightNames = "day" | "night";
