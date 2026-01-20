// Configs
import botWaveModuleConfig from "../../../config/bots/generation/bots.json";

// General
import { mapNames, realMapNames, realBotName } from "../../models/mod";
import Module from "../core/Module";
import type { BotGeneration, BotsConfig, BotWaves } from "../../models/bots";
import { botWavesDefault } from "../../models/bots";
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
import type { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";

export default class BotWave extends Module {
    private readonly botWaveModuleConfig = botWaveModuleConfig as BotsConfig;
    private locationGameConfig: ILocationConfig;
    private locationsGameConfig: ILocations;
    private botGameConfig: IBotConfig;
    private botsGameConfig: IBots;
    private pmcGameConfig: IPmcConfig;
    private botWaves = botWavesDefault as BotWaves;

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
        this.update();
    }

    public update(): void {
        this.resetWaves();
        this.setBotLimits();
        this.setBotVariants();
        this.setLocationSpawns();
        this.logDebug(this.botWaves.timers);
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
    }

    private generateWaves(): void {
        for (let type in this.botWaves.dist) {
            for (
                let i = 0;
                i < this.botWaveModuleConfig.generation[type].waves;
                i++
            ) {
                this.botWaves.dist[type].push(
                    this.calculateDistribution(
                        0,
                        1,
                        this.botWaveModuleConfig.generation[type].distribution,
                        this.botWaveModuleConfig.generation[type]
                            .clusterIntensity,
                    ),
                );
            }
            this.botWaves.dist[type].sort((a: number, b: number) => a - b);
        }
    }

    private setLocationSpawns(): void {
        this.generateWaves();
        for (let map of mapNames) {
            const loc = (this.locationsGameConfig[map] as ILocation).base;
            for (let type in this.botWaves.dist) {
                for (let i = 0; i < this.botWaves.dist[type].length; i++) {
                    this.botWaves.timers[map][type].push(
                        Math.round(
                            loc.EscapeTimeLimit *
                                this.botWaves.dist[type][i] *
                                100,
                        ),
                    );
                }
            }
            loc.BossLocationSpawn = this.generateBossSpawns(map);
            // loc.waves = [
            //     {
            //         BotPreset: "normal",
            //         OpenZones: "",
            //         BotSide: "Savage",
            //         SpawnPoints: "",
            //         WildSpawnType: "bossBully" as WildSpawnType,
            //         isPlayers: false,
            //         number: 1,
            //         slots_max: 3,
            //         slots_min: 3,
            //         time_max: -1,
            //         time_min: -1,
            //         SpawnMode: ["pve", "regular"],
            //     },
            // ];
        }
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

    private calculateDistribution(
        min: number,
        max: number,
        target: number,
        intensity: number,
    ): number {
        const t = Math.pow(Math.random(), Math.abs(intensity - 1));
        const range = Math.random() > 0.5 ? max - target : min - target;
        return parseFloat((target + range * (1 - t)).toFixed(3));
    }

    private generateBossSpawns(mapName: string): IBossLocationSpawn[] {
        const spawns: IBossLocationSpawn[] = [];
        for (let type in this.botWaves.dist) {
            for (let spawnTime of this.botWaves.timers[mapName][type]) {
                const genConfig = this.botWaveModuleConfig.generation[
                    type
                ] as BotGeneration;
                const botType =
                    realBotName[
                        this.Utilities.chooseWeight(genConfig.conversion)
                    ];
                const botDiff = this.Utilities.chooseWeight(
                    genConfig.difficulty,
                );
                const spawn: IBossLocationSpawn = {
                    BossChance: 100,
                    BossDifficult: botDiff,
                    BossEscortAmount: "0",
                    BossEscortDifficult: botDiff,
                    BossEscortType: botType,
                    BossName: botType,
                    BossPlayer: false,
                    BossZone: "",
                    RandomTimeSpawn: false,
                    ForceSpawn: false,
                    Time: spawnTime,
                    TriggerId: "",
                    TriggerName: "",
                    Delay: 0,
                    IgnoreMaxBots: false,
                    Supports: null,
                    // [
                    // {
                    //     BossEscortAmount: "1,2,3",
                    //     BossEscortDifficult: ["normal"],
                    //     BossEscortType: realBotName.test,
                    // },
                    // ],
                    SpawnMode: ["pve", "regular"],
                };
                spawns.push(spawn);
            }
        }
        return spawns;
    }

    private setBotVariants(): void {
        if (this.botWaveModuleConfig.variants.enabled)
            for (let type in this.botWaveModuleConfig.variants.genLimits)
                this.botGameConfig.presetBatch[type] =
                    this.botWaveModuleConfig.variants.genLimits[type];
    }
}
