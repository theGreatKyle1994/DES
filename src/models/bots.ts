// General
import type {
    DifficultyNames,
    MapNames,
    RealBotNames,
    RealMapNames,
} from "./mod";

export const botWavesDefault: BotWaves = {
    dist: {},
    timers: {
        bigmap: {},
        factory4_day: {},
        factory4_night: {},
        interchange: {},
        laboratory: {},
        lighthouse: {},
        rezervbase: {},
        sandbox: {},
        sandbox_high: {},
        shoreline: {},
        tarkovstreets: {},
        woods: {},
    },
};

export interface BotWaves {
    dist: Record<string, number[]>;
    timers: Record<MapNames, Record<string, number[]>>;
}

export interface BotGeneration {
    name: string;
    difficulty: Record<DifficultyNames, number>;
    group: {
        min: number;
        max: number;
        chance: number;
    };
    conversion: Record<RealBotNames, number>;
    waves: number;
    distribution: number;
    clusterIntensity: number;
}

export interface BotLimitsEntry {
    type: RealBotNames;
    min: number;
    max: number;
}

export interface DayNight<KeyType extends string, ValueType> {
    day: Partial<Record<KeyType, ValueType>>;
    night: Partial<Record<KeyType, ValueType>>;
}

export interface BotsConfig {
    generation: {
        starting: {};
        waveLayers: BotGeneration[];
    };
    maxBots: DayNight<RealMapNames, number>;
    limits: Record<RealMapNames, BotLimitsEntry[]>;
}
