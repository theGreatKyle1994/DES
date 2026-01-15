// General
import type { TimeFrameEntry } from "./calendar";
import type { DifficultyNames, MapNames, ZombieNames } from "./mod";

// SPT
import type { IEquipment } from "@spt/models/eft/common/tables/IBotType";
import type {
    IAdditionalHostilitySettings,
    IBossLocationSpawn,
} from "@spt/models/eft/common/ILocationBase";
import type { EquipmentChances } from "@spt/models/eft/common/tables/IBotType";
import type { IHalloween2024 } from "@spt/models/eft/common/ILocationBase";

export interface EventSubConfigs {
    gear: EventSubConfig<BotConfig>[];
    hostility: EventSubConfig<HostilityConfig>[];
    spawns: {
        general: EventSubConfig<SpawnsConfig>[];
        santa: EventSubConfig<SantaConfig>[];
        summon: EventSubConfig<SpawnsConfig>[];
        zombies: EventSubConfig<ZombiesConfig>[];
    };
}

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
        summonConfig?: string;
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

export type ZombiesConfigEntry = IHalloween2024;

export type ZombiesConfig = Record<MapNames, ZombiesConfigEntry>;

export interface BotConfig {
    appearance: {
        body: Record<string, number>;
        feet: Record<string, number>;
    };
    gear: EquipmentChances;
    loot: { [key: string]: IEquipment };
}

export type HostilityConfig = IAdditionalHostilitySettings[];

export type SpawnsConfig = Record<MapNames, IBossLocationSpawn[]>;

export interface SantaConfigEntry {
    zones: string[];
    spawnChance: number;
}

export type SantaConfig = Record<MapNames, SantaConfigEntry>;
