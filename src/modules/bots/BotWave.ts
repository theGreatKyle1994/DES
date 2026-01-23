// Configs
import botWaveModuleConfig from "../../../config/bots/generation/bots.json";

// General
import { mapNames, realMapNames, realBotName } from "../../models/mod";
import Module from "../core/Module";
import type { BotsConfig, BotWaves } from "../../models/bots";
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
        this.logDebug(this.botWaves);
        // this.logDebug(this.locationsGameConfig["woods"].base.BossLocationSpawn);
    }

    public update(): void {
        this.resetWaves();
        this.setBotLimits();
        this.setLocationSpawns();
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

    private generateSpawns(mapName: string): IBossLocationSpawn[] {
        const spawns: IBossLocationSpawn[] = [];
        const waveLayers = this.botWaveModuleConfig.generation.waveLayers;
        for (let j = 0; j < waveLayers.length; j++) {
            const genConfig = waveLayers[j];
            const groupName = waveLayers[j].name;
            const timerGroup: number[] =
                this.botWaves.timers[mapName][groupName];
            for (let i = 0; i < timerGroup.length; i++) {
                const spawnTime = timerGroup[i];
                const botType =
                    realBotName[
                        this.Utilities.chooseWeight(genConfig.conversion)
                    ];
                const botDiff = this.Utilities.chooseWeight(
                    genConfig.difficulty,
                );
                const botGroupSize = this.Utilities.useChance(
                    genConfig.group.chance,
                )
                    ? this.Utilities.genNumberInRange(
                          genConfig.group.min,
                          genConfig.group.max,
                      ).toString()
                    : "0";
                const spawn: IBossLocationSpawn = {
                    BossChance: 100,
                    BossDifficult: botDiff,
                    BossEscortAmount: botGroupSize,
                    BossEscortDifficult: botDiff,
                    BossEscortType: botType,
                    BossName: botType,
                    BossPlayer: false,
                    BossZone: "",
                    Time: spawnTime,
                    RandomTimeSpawn: false,
                    IgnoreMaxBots: false,
                    TriggerId: "",
                    TriggerName: "",
                    Supports: null,
                    SpawnMode: ["pve", "regular"],
                };
                spawns.push(spawn);
            }
        }
        return spawns;
    }

    private generateWaveDist(): void {
        const waveLayers = this.botWaveModuleConfig.generation.waveLayers;
        for (let i = 0; i < waveLayers.length; i++) {
            const groupName = waveLayers[i].name;
            for (let j = 0; j < waveLayers[i].waves; j++) {
                if (!this.botWaves.dist[groupName])
                    this.botWaves.dist[groupName] = [];
                this.botWaves.dist[groupName].push(
                    this.calculateDistribution(
                        0,
                        1,
                        waveLayers[i].distribution,
                        waveLayers[i].clusterIntensity,
                    ),
                );
            }
        }
        for (let key in this.botWaves.dist)
            this.botWaves.dist[key].sort((a: number, b: number) => a - b);
    }

    private setLocationSpawns(): void {
        this.generateWaveDist();
        for (let map of mapNames) {
            const loc = (this.locationsGameConfig[map] as ILocation).base;
            for (let groupName in this.botWaves.dist) {
                const timerMap = this.botWaves.timers[map];
                if (!timerMap[groupName]) timerMap[groupName] = [];
                for (let i = 0; i < this.botWaves.dist[groupName].length; i++) {
                    timerMap[groupName].push(
                        Math.round(
                            loc.EscapeTimeLimit *
                                this.botWaves.dist[groupName][i] *
                                100,
                        ),
                    );
                }
                timerMap[groupName].sort((a: number, b: number) => a - b);
            }
            loc.BossLocationSpawn = this.generateSpawns(map);
        }
    }

    public setMapCaps(): void {
        const timeOfDay = this.Utilities.getIsRaidDayOrNight();
        for (let map in this.botWaveModuleConfig.maxBots[timeOfDay])
            this.botGameConfig.maxBotCap[realMapNames[map]] =
                this.botWaveModuleConfig.maxBots[timeOfDay][map];
    }

    private setBotLimits(): void {
        this.locationGameConfig.enableBotTypeLimits = true;
        this.locationGameConfig.botTypeLimits = {};
        const limits = this.botWaveModuleConfig.limits;
        for (let mapKey in limits) {
            const map = realMapNames[mapKey];
            this.locationGameConfig.botTypeLimits[map] = [];
            for (let i = 0; i < limits[mapKey].length; i++) {
                const entry = limits[mapKey][i];
                this.locationGameConfig.botTypeLimits[map].push({
                    type: realBotName[entry.type] ?? realBotName.Sniper,
                    min: entry.min ?? 0,
                    max: entry.max ?? 1,
                });
            }
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
}
