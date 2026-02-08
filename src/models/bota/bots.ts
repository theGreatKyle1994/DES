// General
import { MapNames } from "../common/commonConstants";
import { BotNames, DifficultyNames } from "./botConstants";
import type { MinMax, DayNight } from "../common/common";

// SPT
import type { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";

export interface BotWaves {
    dist: Record<string, number[]>;
    timers: Record<MapNames, DayNight<Record<string, number[]>>>;
    spawns: Record<MapNames, DayNight<IBossLocationSpawn[]>>;
}

export interface SpawningEntry {
    chance?: number;
    waves?: number;
    distTarget?: number;
    clusterIntensity?: number;
    delay?: number;
    range?: MinMax;
    ignoreMaxBots?: boolean;
}

export interface GuardGroupEntry extends MinMax {
    type: BotNames;
    weight?: number;
}

export interface GroupEntry extends MinMax {
    chance?: number;
    guards?: GuardGroupEntry[];
}

export interface StartingGroupEntry extends MinMax {}

export interface SpawnGroupEntry {
    botTypes: Partial<Record<keyof typeof BotNames, number>>;
    spawning?: SpawningEntry;
    group?: GroupEntry;
    starting?: StartingGroupEntry;
    difficulty?: Record<DifficultyNames, number>;
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
