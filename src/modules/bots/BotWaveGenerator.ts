// Configs
import configBots from "../../../config/bots/generation/bots.json";

// General
import { mapNames, realMapNames } from "../../models/mod";
import Module from "../core/Module";
import type { BotsConfig } from "../../models/bots";
import type { Database } from "../../models/database";

// SPT
import { ContextVariableType } from "@spt/context/ContextVariableType";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IBots } from "@spt/models/spt/bots/IBots";
import type { ILocations } from "@spt/models/spt/server/ILocations";
import type { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import type { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import type { ILocationConfig } from "@spt/models/spt/config/ILocationConfig";
import type { ILocation } from "@spt/models/eft/common/ILocation";
import type { DependencyContainer } from "tsyringe";
import type { ApplicationContext } from "@spt/context/ApplicationContext";
import type { WildSpawnType } from "@spt/models/eft/common/ILocationBase";
import type { WeatherController } from "@spt/controllers/WeatherController";
import type { IGetRaidConfigurationRequestData } from "@spt/models/eft/match/IGetRaidConfigurationRequestData";

export default class BotWaveGenerator extends Module {
    private readonly configBots = configBots as BotsConfig;
    private bots: IBots;
    private locations: ILocations;
    private pmcConfig: IPmcConfig;
    private botConfig: IBotConfig;
    private locationConfig: ILocationConfig;

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    public initialize(): void {
        const { bots, locations } = this.databaseServer.getTables();
        this.bots = bots;
        this.locations = locations;

        this.pmcConfig = this.configServer.getConfig(ConfigTypes.PMC);
        this.botConfig = this.configServer.getConfig(ConfigTypes.BOT);
        this.locationConfig = this.configServer.getConfig(ConfigTypes.LOCATION);
    }

    public enable(): void {
        this.resetWaves();
    }

    public update(): void {
        this.resetWaves();
    }

    private resetWaves(): void {
        // Remove custom waves
        this.locationConfig.addCustomBotWavesToMaps = false;
        this.locationConfig.customWaves = { boss: {}, normal: {} };

        // Remove pmc waves
        this.pmcConfig.removeExistingPmcWaves = true;
        for (let map in this.pmcConfig.customPmcWaves)
            this.pmcConfig.customPmcWaves[map] = [];

        // Remove boss waves and set spawn system
        for (let map of mapNames) {
            const loc = (this.locations[map] as ILocation).base;
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
        const { timeVariant, location } = this.container
            .resolve<ApplicationContext>("ApplicationContext")
            .getLatestValue(ContextVariableType.RAID_CONFIGURATION)
            .getValue<IGetRaidConfigurationRequestData>();

        const time = parseInt(
            this.container
                .resolve<WeatherController>("WeatherController")
                .generate()
                .time.split(":")[0],
        );

        const hour = timeVariant === "PAST" ? (time + 12) % 24 : time;
        let timeOfDay = hour >= 7 && hour <= 20 ? "day" : "night";

        switch (location) {
            case "factory4_day":
                timeOfDay = "day";
                break;
            case "factory4_night":
                timeOfDay = "night";
                break;
        }

        for (let map in this.configBots.maxBots[timeOfDay])
            this.botConfig.maxBotCap[realMapNames[map]] =
                this.configBots.maxBots[timeOfDay][map];
    }

    private setBotLimits(): void {
        if (this.configBots.limits.enabled) {
            this.locationConfig.enableBotTypeLimits = true;
            this.locationConfig.botTypeLimits = {};
            for (let map in realMapNames)
                this.locationConfig.botTypeLimits[realMapNames[map]] =
                    configBots.limits.typeLimits[map];
        }
    }

    private setLocationSpawns(): void {
        for (let map of mapNames) {
            const loc = (this.locations[map] as ILocation).base;
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
        if (this.configBots.variants.enabled)
            for (let type in this.configBots.variants.genLimits)
                this.botConfig.presetBatch[type] =
                    this.configBots.variants.genLimits[type];
    }
}
