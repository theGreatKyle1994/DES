// Configs
import botWaveModuleConfigRaw from "../../../config/bots/spawning/bots.json";
import wavesConfigRaw from "../../../config/bots/spawning/waves.json";
import bossesConfigRaw from "../../../config/bots/spawning/bosses.json";

// General
import Module from "../core/Module";
import {
    wavesConfigDefault,
    botWavesDefault,
    BotNames,
} from "../../models/bota/botConstants";
import { MapNames, mapNames } from "../../models/common/commonConstants";
import type {
    WavesConfig,
    BotWaves,
    BotWaveModuleConfig,
    SpawnGroupEntry,
    GuardGroupEntry,
} from "../../models/bota/bots";
import type { DayNightNames } from "../../models/common/common";
import type { Database } from "../../models/database";

// SPT
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { ILocations } from "@spt/models/spt/server/ILocations";
import type { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import type { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import type { ILocationConfig } from "@spt/models/spt/config/ILocationConfig";
import type { DependencyContainer } from "tsyringe";
import type {
    IBossLocationSpawn,
    IBossSupport,
} from "@spt/models/eft/common/ILocationBase";

export default class BotWave extends Module {
    private locationConfig: ILocationConfig;
    private locationsConfig: ILocations;
    private botConfig: IBotConfig;
    private pmcConfig: IPmcConfig;
    private botWaves: BotWaves = botWavesDefault;
    private readonly botWaveModuleConfig =
        botWaveModuleConfigRaw as BotWaveModuleConfig;
    private wavesConfig: WavesConfig = wavesConfigDefault;

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    public initialize(): void {
        this.locationsConfig = this.databaseServer.getTables().locations;
        this.pmcConfig = this.configServer.getConfig(ConfigTypes.PMC);
        this.botConfig = this.configServer.getConfig(ConfigTypes.BOT);
        this.locationConfig = this.configServer.getConfig(ConfigTypes.LOCATION);

        // Run validation checks for all required configs
        this.mergeWaveConfigs();
        this.validateWaveConfig();
    }

    public enable(): void {
        this.update();
    }

    public update(): void {
        this.resetWaves();
        this.genWaveSpawns();
        this.logDebug(this.botWaves.dist);
        this.logDebug(this.botWaves.timers.bigmap.day);
        // this.logDebug(this.botWaves.spawns.bigmap.day);
    }

    private resetWaves(): void {
        // Map specific spawns disabled
        this.locationConfig.reserveRaiderSpawnChanceOverrides.nonTriggered = 0;
        this.locationConfig.reserveRaiderSpawnChanceOverrides.triggered = 0;
        this.locationConfig.rogueLighthouseSpawnTimeSettings.enabled = false;
        this.locationConfig.rogueLighthouseSpawnTimeSettings.waitTimeSeconds = 0;

        // Remove custom waves
        this.locationConfig.addCustomBotWavesToMaps = false;
        this.locationConfig.customWaves = { boss: {}, normal: {} };

        // Remove pmc waves
        this.pmcConfig.removeExistingPmcWaves = true;
        Object.keys(this.pmcConfig.customPmcWaves).forEach(
            (key) => (this.pmcConfig.customPmcWaves[key] = []),
        );

        // Remove boss waves and set spawn system
        mapNames.forEach((map) => {
            const loc = this.locationsConfig[map].base;
            loc.BossLocationSpawn = [];
            loc.waves = [];
            loc.OldSpawn = true;
            loc.NewSpawn = false;
            loc.OfflineOldSpawn = true;
            loc.OfflineNewSpawn = false;
        });
    }

    private genWaveTimers(): void {
        // Reset timers on raid end
        Object.keys(this.botWaves.timers).forEach((map: MapNames) => {
            this.botWaves.timers[map].day = {};
            this.botWaves.timers[map].night = {};
        });

        // Set timers based on distribution groups
        Object.keys(this.wavesConfig.mapGroups).forEach(
            (timeOfDay: DayNightNames) => {
                Object.entries(this.wavesConfig.mapGroups[timeOfDay]).forEach(
                    (mapGroup: [keyof typeof MapNames, string[]]) => {
                        const [mapKey, group] = mapGroup;
                        const map = MapNames[mapKey];
                        const loc = this.locationsConfig[map].base;
                        const mapTime = loc.EscapeTimeLimit * 60;

                        // Set each group to an empty array
                        group.forEach((groupName) => {
                            const timeMapGroup: number[] =
                                (this.botWaves.timers[map][timeOfDay][
                                    groupName
                                ] = []);

                            // Add starting spawn timers
                            this.Utilities.repeat(
                                this.Utilities.genNumberInRange(
                                    this.wavesConfig.spawnGroups[groupName]
                                        .starting.min,
                                    this.wavesConfig.spawnGroups[groupName]
                                        .starting.max,
                                ),
                                () => timeMapGroup.push(-1),
                            );

                            // Add botGroup timers to group array
                            this.botWaves.dist[groupName].forEach((dist) =>
                                timeMapGroup.push(Math.round(mapTime * dist)),
                            );
                            timeMapGroup.sort((a, b) => a - b);
                        });
                    },
                );
            },
        );
    }

    private genWaveDist(): void {
        // Reset wave distributions on raid end
        this.botWaves.dist = {};

        // Create group distributions
        Object.keys(this.wavesConfig.spawnGroups).forEach((groupName) => {
            const distGroup: number[] = (this.botWaves.dist[groupName] = []);
            const group = this.wavesConfig.spawnGroups[groupName];
            this.Utilities.repeat(group.spawning.waves, () => {
                distGroup.push(
                    this.Utilities.calcDistribution(
                        group.spawning.distTarget,
                        group.spawning.clusterIntensity,
                        group.spawning.range.min,
                        group.spawning.range.max,
                    ),
                );
            });

            // Sort distributions to maintain spawning order
            distGroup.sort((a, b) => a - b);
        });
    }

    private genWaveSpawns(): void {
        // Generate distributions and timers
        this.genWaveDist();
        this.genWaveTimers();

        // Generate group spawns
        Object.keys(this.botWaves.spawns).forEach((map: MapNames) => {
            Object.keys(this.botWaves.spawns[map]).forEach(
                (timeOfDay: DayNightNames) => {
                    // Reset spawns for new raids
                    this.botWaves.spawns[map][timeOfDay] = [];

                    // Generate spawns based on group timers
                    Object.entries(
                        this.botWaves.timers[map][timeOfDay],
                    ).forEach((waveGroup) => {
                        const groupName = waveGroup[0];
                        const timers = waveGroup[1];
                        const spawnWaves = this.botWaves.spawns[map][timeOfDay];
                        const genConfig =
                            this.wavesConfig.spawnGroups[groupName];

                        // Create spawn data for current entry
                        this.Utilities.repeat(timers.length, (i) => {
                            spawnWaves.push(
                                this.createSpawn(genConfig, timers[i]),
                            );
                        });
                    });

                    // Sort timers to maintain spawning order
                    this.botWaves.spawns[map][timeOfDay].sort(
                        (a, b) => a.Time - b.Time,
                    );
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
        const spawnTime = timer === 0 ? 60 : timer;
        const ignoreBotCount =
            genConfig.spawning.ignoreMaxBots || spawnTime === -1;

        const guardGroup: IBossSupport[] = (() => {
            const groupCount = this.Utilities.useChance(genConfig.group.chance)
                ? this.Utilities.genNumberInRange(
                      genConfig.group.min,
                      genConfig.group.max,
                  ).toString()
                : "0";

            if (parseInt(groupCount) <= 0) return [];
            const guards: GuardGroupEntry[] = [];

            if (genConfig.group.guards.length > 0) {
                let weightIndex: Record<string, number> = {};

                genConfig.group.guards.forEach((guardEntry) => {
                    weightIndex[guardEntry.type] = guardEntry.weight;
                });

                const defaultWeightIndex = { ...weightIndex };
                this.Utilities.repeat(parseInt(groupCount), (i) => {
                    const choice = this.Utilities.chooseWeight(weightIndex);
                    guards.push(
                        genConfig.group.guards.find(
                            (guard) => guard.type === choice,
                        ),
                    );

                    if (Object.keys(weightIndex).length >= i + 1)
                        delete weightIndex[choice];
                    else weightIndex = { ...defaultWeightIndex };
                });

                return guards.map((group) => ({
                    BossEscortType: BotNames[group.type],
                    BossEscortAmount: this.Utilities.genNumberInRange(
                        group.min,
                        group.max,
                    ).toString(),
                    BossEscortDifficult: [botDiff],
                }));
            } else
                return [...new Array(parseInt(groupCount))].map(() => ({
                    BossEscortType: botType,
                    BossEscortAmount: "1",
                    BossEscortDifficult: [botDiff],
                }));
        })();

        return {
            BossChance: genConfig.spawning.chance,
            BossDifficult: botDiff,
            BossEscortAmount: guardGroup.length.toString(),
            BossEscortDifficult: botDiff,
            BossEscortType: botType,
            BossName: botType,
            BossPlayer: false,
            BossZone: "",
            Delay: genConfig.spawning.delay,
            Time: spawnTime,
            RandomTimeSpawn: false,
            IgnoreMaxBots: ignoreBotCount,
            TriggerId: "",
            TriggerName: "",
            Supports: guardGroup,
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
        const mapSpawns = this.botWaves.spawns[map][timeOfDay];

        // Full reset of spawns in case of map / time swap
        this.locationsConfig[map].base.BossLocationSpawn = mapSpawns;
        this.setMapCaps(timeOfDay);
        this.setBotLimits();
    }

    private validateWaveConfig(): void {
        Object.entries(this.wavesConfig.spawnGroups).forEach((groupConfig) => {
            const { spawning, botTypes, group, starting, difficulty } =
                groupConfig[1];

            group?.guards &&
                group.guards.forEach((guardGroup, i) => {
                    group.guards[i] = {
                        type: guardGroup?.type,
                        weight: guardGroup?.weight ?? 1,
                        min: guardGroup?.min ?? 1,
                        max: guardGroup?.max ?? 1,
                    };
                });

            this.wavesConfig.spawnGroups[groupConfig[0]] = {
                spawning: {
                    chance: spawning?.chance ?? 100,
                    waves: spawning?.waves ?? 1,
                    distTarget: spawning?.distTarget ?? 0.5,
                    clusterIntensity: spawning?.clusterIntensity ?? 0,
                    delay: spawning?.delay ?? 0,
                    range: {
                        min: spawning?.range?.min ?? 0,
                        max: spawning?.range?.max ?? 1,
                    },
                    ignoreMaxBots: spawning?.ignoreMaxBots ?? false,
                },
                botTypes: botTypes ?? { Scav: 1 },
                group: {
                    chance: group?.chance ?? 0,
                    min: group?.min ?? 2,
                    max: group?.max ?? 3,
                    guards: group?.guards ?? [],
                },
                starting: {
                    min: starting?.min ?? 0,
                    max: starting?.max ?? 0,
                },
                difficulty: {
                    easy: difficulty?.easy ?? 25,
                    normal: difficulty?.normal ?? 60,
                    hard: difficulty?.hard ?? 10,
                    impossible: difficulty?.impossible ?? 5,
                },
            };
        });
    }

    private mergeWaveConfigs(): void {
        const waves = wavesConfigRaw as WavesConfig;
        const bosses = bossesConfigRaw as WavesConfig;
        Object.keys(this.wavesConfig.mapGroups).forEach(
            (timeOfDay: DayNightNames) => {
                Object.entries(this.wavesConfig.mapGroups[timeOfDay]).forEach(
                    (mapData: [keyof typeof MapNames, string[]]) => {
                        const [map, arr] = mapData;
                        this.wavesConfig.mapGroups[timeOfDay][map] = [
                            ...waves.mapGroups[timeOfDay][map],
                            ...bosses.mapGroups[timeOfDay][map],
                        ];
                    },
                );
            },
        );
        this.wavesConfig.spawnGroups = {
            ...waves.spawnGroups,
            ...bosses.spawnGroups,
        };
    }
}
