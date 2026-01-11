// General
import type { TimeFrameEntry } from "./calendar";
import type { DifficultyNames, MapNames, ZombieNames } from "./mod";

// SPT
import type { IEquipment } from "@spt/models/eft/common/tables/IBotType";
import type {
    IAdditionalHostilitySettings,
    IBossLocationSpawn,
} from "@spt/models/eft/common/ILocationBase";

export interface EventSubConfig<ConfigType> {
    name: string;
    config: ConfigType;
}

export interface EventConfigEntry {
    enabled: boolean;
    name: string;
    timeFrame: TimeFrameEntry;
    forceSeason: string;
    forceWeather: string;
    settings?: {
        hideoutTypes?: string[];
        santaConfig?: string;
        botConfig?: string;
        spawnsConfig?: string;
        zombiesConfig?: string;
        hostilityConfig?: string;
    };
}

export interface EventConfig {
    core: {
        [key: string]: EventConfigEntry;
    };
    additive: {
        [key: string]: EventConfigEntry;
    };
}

export interface ZombieCrowdEntry {
    difficulty: DifficultyNames;
    role: ZombieNames;
    weight: number;
}

export interface ZombiesConfigEntry {
    infectionRange: [number, number];
    crowdAttackBlockRadius: number;
    crowdCooldownPerPlayerSec: number;
    crowdsLimit: number;
    infectedLookCoeff: number;
    minInfectionPercentage: number;
    infectionPercentage: number;
    maxCrowdAttackSpawnLimit: number;
    minSpawnDistToPlayer: number;
    targetPointSearchRadiusLimit: number;
    zombieCallDeltaRadius: number;
    zombieCallPeriodSec: number;
    zombieCallRadiusLimit: number;
    zombieMultiplier: number;
    crowdAttackSpawnParams: ZombieCrowdEntry[];
}

export type ZombiesConfig = Record<MapNames, ZombiesConfigEntry>;

export interface BotConfig {
    appearance: {
        body: Record<string, number>;
        feet: Record<string, number>;
    };
    gear: { [key: string]: IEquipment };
    loot: { [key: string]: IEquipment };
}

export interface HostilityConfig {
    default: IAdditionalHostilitySettings[];
}

export type SpawnsConfig = Record<MapNames, IBossLocationSpawn[]>;

export interface SantaConfigEntry {
    zones: string[];
    spawnChance: number;
}

export type SantaConfig = Record<MapNames, SantaConfigEntry>;
