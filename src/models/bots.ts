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

export interface GuardEntry {
    type: RealBotNames;
    weight: number;
    min: number;
    max: number;
}

export interface BossConfigEntry {
    boss: RealBotNames;
    chance: number;
    minGuards: number;
    maxGuards: number;
    guards: GuardEntry[];
}

export interface BossesConfig {
    difficulty: Record<DifficultyNames, number>;
    maps: Record<RealMapNames, BossConfigEntry[]>;
}

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
    starting: {
        min: number;
        max: number;
        useGroups: boolean;
        ignoreBotCap: boolean;
    };
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
        waveGroups: BotGeneration[];
    };
    maxBots: DayNight<RealMapNames, number>;
    limits: Record<RealMapNames, BotLimitsEntry[]>;
}
