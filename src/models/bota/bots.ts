// General
import { MapNames } from "../common/commonConstants";
import type { MinMax, DayNight } from "../common/common";
import type { BotNames, DifficultyNames } from "./botConstants";

// SPT
import type { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";

export interface GroupEntry extends MinMax {
    chance?: number;
}

export interface StartingGroupEntry extends MinMax {
    useGroups: boolean;
    ignoreBotCap: boolean;
}

export interface SpawnGroupEntry {
    difficulty: Record<DifficultyNames, number>;
    group: GroupEntry;
    botTypes: Partial<Record<keyof typeof BotNames, number>>;
    starting: StartingGroupEntry;
    waves: number;
    distribution: number;
    clusterIntensity: number;
}

export interface BotSpawns {
    waves: IBossLocationSpawn[];
    bosses: IBossLocationSpawn[];
}

export interface BotWaves {
    dist: Record<string, number[]>;
    timers: Record<MapNames, DayNight<Record<string, number[]>>>;
    spawns: Record<MapNames, DayNight<BotSpawns>>;
}

export interface BotLimitEntry {
    type: keyof typeof BotNames;
    min: number;
    max: number;
}

export interface WavesConfig {
    mapGroups: DayNight<Partial<Record<keyof typeof MapNames, string[]>>>;
    spawnGroups: Record<string, SpawnGroupEntry>;
}

export interface BotWaveModuleConfig {
    maxBots: DayNight<Partial<Record<keyof typeof MapNames, number>>>;
    limits: Record<keyof typeof MapNames, BotLimitEntry[]>;
}
