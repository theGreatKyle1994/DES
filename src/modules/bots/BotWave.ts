// Configs
import botWaveModuleConfig from "../../../config/bots/spawning/bots.json";
import wavesConfig from "../../../config/bots/spawning/waves.json";
import bossesConfig from "../../../config/bots/spawning/bosses.json";

// General
import { mapNames, realMapNames, realBotName } from "../../utilities/constants";
import Module from "../core/Module";
import { botWavesDefault } from "../../models/bots";
import type { MapNames, RealMapNames } from "../../models/common";
import type { BotWaves } from "../../models/bots";
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
    private locationConfig: ILocationConfig;
    private locationsConfig: ILocations;
    private botConfig: IBotConfig;
    private botsConfig: IBots;
    private pmcConfig: IPmcConfig;
    private botWaves: BotWaves = botWavesDefault;

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
        type SpawnGroupName = keyof typeof wavesConfig.spawnGroups;
        Object.keys(wavesConfig.mapGroups).forEach(
            (timeOfDay: "day" | "night") => {
                Object.entries(wavesConfig.mapGroups[timeOfDay]).forEach(
                    (mapGroup: [RealMapNames, string[]]) => {
                        const [mapKey, group] = mapGroup;
                        const map = realMapNames[mapKey] as MapNames;
                        const loc = this.locationsConfig[map].base;
                        const mapTime = loc.EscapeTimeLimit * 60;
                        group.forEach((groupName: SpawnGroupName) => {
                            const timeMapGroup = (this.botWaves.timers[map][
                                timeOfDay
                            ][groupName] = []);

                            // Add starting spawn timers
                            const startRange =
                                wavesConfig.spawnGroups[groupName].starting;
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
        Object.keys(wavesConfig.spawnGroups).forEach(
            (groupName: keyof typeof wavesConfig.spawnGroups) => {
                const distGroup = (this.botWaves.dist[groupName] = []);
                const group = wavesConfig.spawnGroups[groupName];
                this.Utilities.repeat(group.waves, () => {
                    distGroup.push(
                        this.Utilities.calcDistribution(
                            group.distribution,
                            group.clusterIntensity,
                        ),
                    );
                });
                distGroup.sort((a, b) => a - b);
            },
        );
    }

    private genWaveSpawns(): void {
        this.genWaveDist();
        this.genWaveTimers();
        Object.keys(this.botWaves.spawns).forEach((map: MapNames) => {
            Object.keys(this.botWaves.spawns[map]).forEach(
                (timeOfDay: "day" | "night") => {
                    Object.entries(
                        this.botWaves.timers[map][timeOfDay],
                    ).forEach(
                        (
                            waveGroup: [
                                keyof typeof wavesConfig.spawnGroups,
                                number[],
                            ],
                        ) => {
                            const groupName = waveGroup[0];
                            const timers = waveGroup[1];
                            const spawnWaves =
                                this.botWaves.spawns[map][timeOfDay].waves;
                            this.Utilities.repeat(timers.length, (i) => {
                                const genConfig =
                                    wavesConfig.spawnGroups[groupName];
                                const botDiff = this.Utilities.chooseWeight(
                                    genConfig.difficulty,
                                );
                                const botType =
                                    realBotName[
                                        this.Utilities.chooseWeight(
                                            genConfig.botTypes,
                                        )
                                    ];
                                const spawnTime =
                                    timers[i] === 0 ? 10 : timers[i];
                                const spawn: IBossLocationSpawn = {
                                    BossChance: 100,
                                    BossDifficult: botDiff,
                                    BossEscortAmount:
                                        (spawnTime === -1 &&
                                            !genConfig.starting.useGroups) ||
                                        !this.Utilities.useChance(
                                            genConfig.group.chance,
                                        )
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
                                    IgnoreMaxBots:
                                        spawnTime === -1 &&
                                        genConfig.starting.ignoreBotCap,
                                    TriggerId: "",
                                    TriggerName: "",
                                    Supports: null,
                                    SpawnMode: ["pve", "regular"],
                                };
                                spawnWaves.push(spawn);
                            });
                        },
                    );
                },
            );
        });
    }

    private setBotLimits(): void {
        // Reset all bot limits
        this.locationConfig.enableBotTypeLimits = true;
        this.locationConfig.botTypeLimits = {};

        // Set bot limits
        Object.keys(botWaveModuleConfig.limits).forEach(
            (mapKey: RealMapNames) => {
                const map = realMapNames[mapKey];
                // Place empty array for each map entry
                this.locationConfig.botTypeLimits[map] = [];
                // Push all entries from config
                botWaveModuleConfig.limits[mapKey].forEach((entry) => {
                    this.locationConfig.botTypeLimits[map].push({
                        type: realBotName[entry.type],
                        min: entry.min,
                        max: entry.max,
                    });
                });
            },
        );
    }

    private setMapCaps(timeOfDay: "day" | "night"): void {
        for (let map in botWaveModuleConfig.maxBots[timeOfDay])
            this.botConfig.maxBotCap[realMapNames[map]] =
                botWaveModuleConfig.maxBots[timeOfDay][map];
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
