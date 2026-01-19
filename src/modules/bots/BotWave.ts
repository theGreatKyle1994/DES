// Configs
import botWaveModuleConfig from "../../../config/bots/generation/bots.json";

// General
import { mapNames, realMapNames } from "../../models/mod";
import Module from "../core/Module";
import type { BotsConfig } from "../../models/bots";
import type { Database } from "../../models/database";

// SPT
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IBots } from "@spt/models/spt/bots/IBots";
import type { ILocations } from "@spt/models/spt/server/ILocations";
import type { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import type { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import type { ILocationConfig } from "@spt/models/spt/config/ILocationConfig";
import type { ILocation } from "@spt/models/eft/common/ILocation";
import type { DependencyContainer } from "tsyringe";
import type { WildSpawnType } from "@spt/models/eft/common/ILocationBase";

export default class BotWave extends Module {
    private readonly botWaveModuleConfig = botWaveModuleConfig as BotsConfig;
    private locationGameConfig: ILocationConfig;
    private locationsGameConfig: ILocations;
    private botGameConfig: IBotConfig;
    private botsGameConfig: IBots;
    private pmcGameConfig: IPmcConfig;

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    public initialize(): void {
        const { bots, locations } = this.databaseServer.getTables();
        this.botsGameConfig = bots;
        this.locationsGameConfig = locations;
        this.pmcGameConfig = this.configServer.getConfig(ConfigTypes.PMC);
        this.botGameConfig = this.configServer.getConfig(ConfigTypes.BOT);
        this.locationGameConfig = this.configServer.getConfig(
            ConfigTypes.LOCATION,
        );
    }

    public enable(): void {
        this.resetWaves();
    }

    public update(): void {
        this.resetWaves();
    }

    private resetWaves(): void {
        // Remove custom waves
        this.locationGameConfig.addCustomBotWavesToMaps = false;
        this.locationGameConfig.customWaves = { boss: {}, normal: {} };

        // Remove pmc waves
        this.pmcGameConfig.removeExistingPmcWaves = true;
        for (let map in this.pmcGameConfig.customPmcWaves)
            this.pmcGameConfig.customPmcWaves[map] = [];

        // Remove boss waves and set spawn system
        for (let map of mapNames) {
            const loc = (this.locationsGameConfig[map] as ILocation).base;
            loc.BossLocationSpawn = [];
            loc.waves = [];
            loc.OldSpawn = true;
            loc.NewSpawn = false;
            loc.OfflineOldSpawn = true;
            loc.OfflineNewSpawn = false;
        }

        this.setBotVariants();
        this.setBotLimits();
    }

    public setMapCaps(): void {
        const timeOfDay = this.Utilities.getIsRaidDayOrNight();
        for (let map in this.botWaveModuleConfig.maxBots[timeOfDay])
            this.botGameConfig.maxBotCap[realMapNames[map]] =
                this.botWaveModuleConfig.maxBots[timeOfDay][map];
    }

    private setBotLimits(): void {
        if (this.botWaveModuleConfig.limits.enabled) {
            this.locationGameConfig.enableBotTypeLimits = true;
            this.locationGameConfig.botTypeLimits = {};
            for (let map in realMapNames)
                this.locationGameConfig.botTypeLimits[realMapNames[map]] =
                    botWaveModuleConfig.limits.typeLimits[map];
        }
    }

    private setLocationSpawns(): void {
        for (let map of mapNames) {
            const loc = (this.locationsGameConfig[map] as ILocation).base;
            loc.BossLocationSpawn = [
                {
                    BossChance: 100,
                    BossDifficult: "normal",
                    BossEscortAmount: "1,2,3",
                    BossEscortDifficult: "normal",
                    BossEscortType: "assault",
                    BossName: "assault",
                    BossPlayer: false,
                    BossZone: "",
                    RandomTimeSpawn: false,
                    Time: 1,
                    TriggerId: "",
                    TriggerName: "",
                    Delay: 0,
                    IgnoreMaxBots: true,
                    Supports: [
                        {
                            BossEscortAmount: "1,2,3",
                            BossEscortDifficult: ["normal"],
                            BossEscortType: "assault",
                        },
                    ],
                    SpawnMode: ["pve", "regular"],
                },
            ];
            loc.waves = [
                {
                    BotPreset: "normal",
                    OpenZones: "",
                    BotSide: "Savage",
                    SpawnPoints: "",
                    WildSpawnType: "bossBully" as WildSpawnType,
                    isPlayers: false,
                    number: 1,
                    slots_max: 3,
                    slots_min: 3,
                    time_max: -1,
                    time_min: -1,
                    SpawnMode: ["pve", "regular"],
                },
            ];
        }
    }

    private setBotVariants(): void {
        if (this.botWaveModuleConfig.variants.enabled)
            for (let type in this.botWaveModuleConfig.variants.genLimits)
                this.botGameConfig.presetBatch[type] =
                    this.botWaveModuleConfig.variants.genLimits[type];
    }
}
