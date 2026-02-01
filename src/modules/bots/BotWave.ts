// Configs
import botWaveModuleConfigRaw from "../../../config/bots/spawning/bots.json";
import wavesConfigRaw from "../../../config/bots/spawning/waves.json";
import bossesConfig from "../../../config/bots/spawning/bosses.json";

// General
import Module from "../core/Module";
import { botWavesDefault, BotNames } from "../../models/bota/botConstants";
import { MapNames, mapNames } from "../../models/common/commonConstants";
import type {
    WavesConfig,
    BotWaves,
    BotWaveModuleConfig,
    SpawnGroupEntry,
} from "../../models/bota/bots";
import type { DayNightNames } from "../../models/common/common";
import type { Database } from "../../models/database";

// SPT
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IBots } from "@spt/models/spt/bots/IBots";
import type { ILocations } from "@spt/models/spt/server/ILocations";
import type { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import type { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import type { ILocationConfig } from "@spt/models/spt/config/ILocationConfig";
import type { DependencyContainer } from "tsyringe";
import type { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";

export default class BotWave extends Module {
    private locationConfig: ILocationConfig;
    private locationsConfig: ILocations;
    private botConfig: IBotConfig;
    private botsConfig: IBots;
    private pmcConfig: IPmcConfig;
    private botWaves: BotWaves = botWavesDefault;
    private readonly botWaveModuleConfig =
        botWaveModuleConfigRaw as BotWaveModuleConfig;
    private readonly wavesConfig = wavesConfigRaw as WavesConfig;

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    public initialize(): void {
        const { bots, locations } = this.databaseServer.getTables();
        this.botsConfig = bots;
        this.locationsConfig = locations;
        this.pmcConfig = this.configServer.getConfig(ConfigTypes.PMC);
        this.botConfig = this.configServer.getConfig(ConfigTypes.BOT);
        this.locationConfig = this.configServer.getConfig(ConfigTypes.LOCATION);
    }

    public enable(): void {
        this.update();
    }

    public update(): void {
        this.resetWaves();
        this.genWaveSpawns();
        this.logDebug(this.botWaves.spawns.interchange.day.waves);
    }

    private resetWaves(): void {
        // Remove custom waves
        this.locationConfig.addCustomBotWavesToMaps = false;
        this.locationConfig.customWaves = { boss: {}, normal: {} };

        // Remove pmc waves
        this.pmcConfig.removeExistingPmcWaves = true;
        Object.keys(this.pmcConfig.customPmcWaves).forEach(
            (key) => (this.pmcConfig.customPmcWaves[key] = []),
        );

        // Remove boss waves and set spawn system
        mapNames.forEach((val) => {
            const loc = this.locationsConfig[val].base;
            loc.BossLocationSpawn = [];
            loc.waves = [];
            loc.OldSpawn = true;
            loc.NewSpawn = false;
            loc.OfflineOldSpawn = true;
            loc.OfflineNewSpawn = false;
        });
    }

    private genWaveTimers(): void {
        Object.keys(this.wavesConfig.mapGroups).forEach(
            (timeOfDay: DayNightNames) => {
                Object.entries(this.wavesConfig.mapGroups[timeOfDay]).forEach(
                    (mapGroup) => {
                        const [mapKey, group] = mapGroup;
                        const map = MapNames[mapKey] as MapNames;
                        const loc = this.locationsConfig[map].base;
                        const mapTime = loc.EscapeTimeLimit * 60;
                        group.forEach((groupName) => {
                            const timeMapGroup = (this.botWaves.timers[map][
                                timeOfDay
                            ][groupName] = []);

                            // Add starting spawn timers
                            const startRange =
                                this.wavesConfig.spawnGroups[groupName]
                                    .starting;
                            this.Utilities.repeat(
                                this.Utilities.genNumberInRange(
                                    startRange.min,
                                    startRange.max,
                                ),
                                () => {
                                    timeMapGroup.push(-1);
                                },
                            );

                            // Add group timers
                            this.botWaves.dist[groupName].forEach((dist) => {
                                timeMapGroup.push(Math.round(mapTime * dist));
                            });
                        });
                    },
                );
            },
        );
    }

    private genWaveDist(): void {
        Object.keys(this.wavesConfig.spawnGroups).forEach((groupName) => {
            const distGroup = (this.botWaves.dist[groupName] = []);
            const group = this.wavesConfig.spawnGroups[groupName];
            this.Utilities.repeat(group.waves, () => {
                distGroup.push(
                    this.Utilities.calcDistribution(
                        group.distribution,
                        group.clusterIntensity,
                    ),
                );
            });
            distGroup.sort((a, b) => a - b);
        });
    }

    private genWaveSpawns(): void {
        this.genWaveDist();
        this.genWaveTimers();
        Object.keys(this.botWaves.spawns).forEach((map: MapNames) => {
            Object.keys(this.botWaves.spawns[map]).forEach(
                (timeOfDay: DayNightNames) => {
                    Object.entries(
                        this.botWaves.timers[map][timeOfDay],
                    ).forEach((waveGroup) => {
                        const groupName = waveGroup[0];
                        const timers = waveGroup[1];
                        const spawnWaves =
                            this.botWaves.spawns[map][timeOfDay].waves;
                        const genConfig =
                            this.wavesConfig.spawnGroups[groupName];
                        this.Utilities.repeat(timers.length, (i) => {
                            spawnWaves.push(
                                this.createSpawn(genConfig, timers[i]),
                            );
                        });
                    });
                },
            );
        });
    }

    private createSpawn(
        genConfig: SpawnGroupEntry,
        timer: number,
    ): IBossLocationSpawn {
        const botDiff = this.Utilities.chooseWeight(genConfig.difficulty);
        const botType =
            BotNames[this.Utilities.chooseWeight(genConfig.botTypes)];
        const spawnTime = timer === 0 ? 10 : timer;
        return {
            BossChance: 100,
            BossDifficult: botDiff,
            BossEscortAmount:
                (spawnTime === -1 && !genConfig.starting.useGroups) ||
                !this.Utilities.useChance(genConfig.group.chance)
                    ? "0"
                    : this.Utilities.genNumberInRange(
                          genConfig.group.min,
                          genConfig.group.max,
                      ).toString(),
            BossEscortDifficult: botDiff,
            BossEscortType: botType,
            BossName: botType,
            BossPlayer: false,
            BossZone: "",
            Time: spawnTime,
            RandomTimeSpawn: false,
            IgnoreMaxBots: spawnTime === -1 && genConfig.starting.ignoreBotCap,
            TriggerId: "",
            TriggerName: "",
            Supports: null,
            SpawnMode: ["pve", "regular"],
        };
    }

    private setBotLimits(): void {
        // Reset all bot limits
        this.locationConfig.enableBotTypeLimits = true;
        this.locationConfig.botTypeLimits = {};

        // Set bot limits
        Object.keys(this.botWaveModuleConfig.limits).forEach(
            (mapKey: keyof typeof MapNames) => {
                const map = MapNames[mapKey];
                // Place empty array for each map entry
                this.locationConfig.botTypeLimits[map] = [];
                // Push all entries from config
                this.botWaveModuleConfig.limits[mapKey].forEach((entry) => {
                    this.locationConfig.botTypeLimits[map].push({
                        type: BotNames[entry.type],
                        min: entry.min,
                        max: entry.max,
                    });
                });
            },
        );
    }

    private setMapCaps(timeOfDay: DayNightNames): void {
        for (let map in this.botWaveModuleConfig.maxBots[timeOfDay])
            this.botConfig.maxBotCap[MapNames[map]] =
                this.botWaveModuleConfig.maxBots[timeOfDay][map];
    }

    public setMapData(): void {
        const timeOfDay = this.Utilities.getIsRaidDayOrNight();
        const map = this.Utilities.getCurrentMap();
        const { waves, bosses } = this.botWaves.spawns[map][timeOfDay];
        const mapSpawns = [...waves, ...bosses];

        // Full reset of spawns in case of map / time swap
        this.locationsConfig[map].base.BossLocationSpawn = mapSpawns;

        this.setMapCaps(timeOfDay);
        this.setBotLimits();

        this.logDebug(map);
        this.logDebug(timeOfDay);
        this.logDebug(this.locationsConfig[map].base.BossLocationSpawn);
    }
}
