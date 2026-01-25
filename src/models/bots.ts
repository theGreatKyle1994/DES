// General
import type { MapNames } from "./common";

// SPT
import type { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";

export const botWavesDefault: BotWaves = {
    dist: {},
    timers: {
        bigmap: { day: {}, night: {} },
        factory4_day: { day: {} },
        factory4_night: { night: {} },
        interchange: { day: {}, night: {} },
        laboratory: { day: {}, night: {} },
        lighthouse: { day: {}, night: {} },
        rezervbase: { day: {}, night: {} },
        sandbox: { day: {}, night: {} },
        sandbox_high: { day: {}, night: {} },
        shoreline: { day: {}, night: {} },
        tarkovstreets: { day: {}, night: {} },
        woods: { day: {}, night: {} },
    },
    spawns: {
        bigmap: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        factory4_day: { day: { waves: [], bosses: [] } },
        factory4_night: { night: { waves: [], bosses: [] } },
        interchange: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        laboratory: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        lighthouse: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        rezervbase: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        sandbox: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        sandbox_high: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        shoreline: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        tarkovstreets: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
        woods: {
            day: { waves: [], bosses: [] },
            night: { waves: [], bosses: [] },
        },
    },
};

export interface DayNight<T> {
    day?: T;
    night?: T;
}

export interface SpawnEntry<T> {
    waves: T[];
    bosses: T[];
}

export interface BotWaves {
    dist: Record<string, number[]>;
    timers: Record<MapNames, DayNight<Record<string, number[]>>>;
    spawns: Record<MapNames, DayNight<SpawnEntry<IBossLocationSpawn>>>;
}
