// Configs
import eventModuleConfig from "../../config/event/events.json";

// General
import Module from "./core/Module";
import type {
    EventSubConfigs,
    EventConfig,
    SpawnsConfig,
    ZombiesConfig,
} from "../models/event";
import type { Database } from "../models/database";

// SPT
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ISeasonalEventConfig } from "@spt/models/spt/config/ISeasonalEventConfig";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IGlobals } from "@spt/models/eft/common/IGlobals";
import type { IBots } from "@spt/models/spt/bots/IBots";
import type { ILocation } from "@spt/models/eft/common/ILocation";
import type { ILocations } from "@spt/models/spt/server/ILocations";
import type { ILocationBase } from "@spt/models/eft/common/ILocationBase";
import type { DependencyContainer } from "tsyringe";

export default class EventModule extends Module {
    private readonly eventModuleConfig = eventModuleConfig as EventConfig;
    private eventModuleSubConfigs: EventSubConfigs;
    private globalGameConfig: IGlobals;
    private seasonalEventGameConfig: ISeasonalEventConfig;
    private botsGameConfig: IBots;
    private locationsGameConfig: ILocations;
    private readonly coreEventNames: string[] = [];
    private readonly additiveEventNames: string[] = [];

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    public preInitialize(): void {
        this.seasonalEventGameConfig = this.configServer.getConfig(
            ConfigTypes.SEASONAL_EVENT,
        );

        this.seasonalEventGameConfig.enableSeasonalEventDetection = false;
        for (let event of this.seasonalEventGameConfig.events)
            event.enabled = false;
    }

    public initialize(): void {
        const { globals, bots, locations } = this.databaseServer.getTables();
        this.globalGameConfig = globals;
        this.botsGameConfig = bots;
        this.locationsGameConfig = locations;

        this.eventModuleSubConfigs = {
            gear: this.Utilities.loadConfigs("event/bots/gear") ?? [],
            hostility: this.Utilities.loadConfigs("event/bots/hostility") ?? [],
            spawns: {
                general:
                    this.Utilities.loadConfigs("event/bots/spawns/general") ??
                    [],
                santa:
                    this.Utilities.loadConfigs("event/bots/spawns/santa") ?? [],
                summon:
                    this.Utilities.loadConfigs("event/bots/spawns/summon") ??
                    [],
                zombies:
                    this.Utilities.loadConfigs("event/bots/spawns/zombies") ??
                    [],
            },
        };

        for (let event in this.eventModuleConfig.core)
            this.coreEventNames.push(event);
        for (let event in this.eventModuleConfig.additive)
            this.additiveEventNames.push(event);
    }

    public enable(): void {
        this.activateZombies();
        // this.removeEventData();
        this.update();
    }

    public update(): void {}

    private removeEventData(): void {
        this.resetHideout();
        this.resetGifter();
    }

    private resetHideout(): void {
        // Remove hideout definitions
        this.globalGameConfig.config.EventType = [];
    }

    private resetGifter(): void {
        // Remove spawn data
        for (let location in this.locationsGameConfig) {
            const locBase: ILocationBase =
                this.locationsGameConfig[location].base;
            if (locBase?.BossLocationSpawn) {
                for (let boss of locBase.BossLocationSpawn) {
                    if (boss.BossName === "gifter") {
                        locBase?.BossLocationSpawn.splice(
                            locBase?.BossLocationSpawn.indexOf(boss),
                            1,
                        );
                    }
                }
            }
        }
        // Remove any item drop data
        for (let diff in this.botsGameConfig.types["gifter"].difficulty) {
            this.botsGameConfig.types["gifter"].difficulty[diff].Patrol[
                "ITEMSTODROP"
            ] = [];
        }
    }

    private activateZombies(): void {
        this.botsGameConfig.core.ACTIVE_HALLOWEEN_ZOMBIES_EVENT = true;
        this.globalGameConfig.config.SeasonActivity.InfectionHalloween.DisplayUIEnabled = true;
        this.globalGameConfig.config.SeasonActivity.InfectionHalloween.Enabled = true;

        this.globalGameConfig.LocationInfection.Interchange = 75;
        this.globalGameConfig.LocationInfection.Lighthouse = 25;
        this.globalGameConfig.LocationInfection.RezervBase = 75;
        this.globalGameConfig.LocationInfection.Sandbox = 50;
        this.globalGameConfig.LocationInfection.Shoreline = 25;
        this.globalGameConfig.LocationInfection.TarkovStreets = 100;
        this.globalGameConfig.LocationInfection.Woods = 25;
        this.globalGameConfig.LocationInfection.bigmap = 50;
        this.globalGameConfig.LocationInfection.factory4 = 100;
        this.globalGameConfig.LocationInfection.laboratory = 100;

        const zombieSpawns = this.eventModuleSubConfigs.spawns.general.filter(
            (config) => config.name === "zombies",
        )[0];

        const hostility = this.eventModuleSubConfigs.hostility.filter(
            (config) => config.name === "zombies",
        )[0];

        const zombieConfig = this.eventModuleSubConfigs.spawns.zombies.filter(
            (config) => config.name === "zombies",
        )[0];

        for (let map in zombieSpawns.config) {
            const currentMap = this.locationsGameConfig[map] as ILocation;
            const zombieSettings =
                zombieConfig.config[map as keyof ZombiesConfig];
            // Add Zombie Spawns
            currentMap.base.BossLocationSpawn = [
                ...currentMap.base.BossLocationSpawn,
                ...zombieSpawns.config[map as keyof SpawnsConfig],
            ];
            // Adjust Hostility
            currentMap.base.BotLocationModifier.AdditionalHostilitySettings.default =
                hostility.config;
            // Adjust Zombie Settings
            currentMap.base.Events.Halloween2024 = zombieSettings;
        }

        // this.logger.success(
        //     JSON.stringify(
        //         this.locations.woods.base.Events.Halloween2024,
        //         null,
        //         4
        //     )
        // );
    }
}
