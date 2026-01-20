// General
import type {
    BotNamesAll,
    DifficultyNames,
    MapNames,
    RealBotNames,
    RealMapNames,
} from "./mod";

export const botWavesDefault: BotWaves = {
    dist: { pmc: [], scav: [] },
    timers: {
        bigmap: { pmc: [], scav: [] },
        factory4_day: { pmc: [], scav: [] },
        factory4_night: { pmc: [], scav: [] },
        interchange: { pmc: [], scav: [] },
        laboratory: { pmc: [], scav: [] },
        lighthouse: { pmc: [], scav: [] },
        rezervbase: { pmc: [], scav: [] },
        sandbox: { pmc: [], scav: [] },
        sandbox_high: { pmc: [], scav: [] },
        shoreline: { pmc: [], scav: [] },
        tarkovstreets: { pmc: [], scav: [] },
        woods: { pmc: [], scav: [] },
    },
};

export interface BotCoreList {
    pmc: number[];
    scav: number[];
}

export interface BotWaves {
    dist: BotCoreList;
    timers: Record<MapNames, BotCoreList>;
}

export interface BotGeneration {
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
    type: BotNamesAll;
    min: number;
    max: number;
}

export interface DayNight<KeyType extends string, ValueType> {
    day: Partial<Record<KeyType, ValueType>>;
    night: Partial<Record<KeyType, ValueType>>;
}

export interface BotsConfig {
    generation: {
        pmc: BotGeneration;
        scav: BotGeneration;
    };
    maxBots: DayNight<RealMapNames, number>;
    limits: {
        enabled: boolean;
        typeLimits: Record<RealMapNames, BotLimitsEntry[]>;
    };
    variants: {
        enabled: boolean;
        genLimits: Partial<Record<BotNamesAll, number>>;
    };
}
