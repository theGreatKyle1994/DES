// General
import type { BotNamesAll, RealMapNames } from "./mod";

export interface BotLimitsEntry {
    type: BotNamesAll | string;
    min: number;
    max: number;
}

export interface DayNight<KeyType extends string, ValueType> {
    day: Partial<Record<KeyType, ValueType>>;
    night: Partial<Record<KeyType, ValueType>>;
}

export interface BotsConfig {
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
