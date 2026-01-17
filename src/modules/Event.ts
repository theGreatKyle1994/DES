// Configs
import eventConfig from "../../config/event/events.json";

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
    private globalValues: IGlobals;
    private eventValues: ISeasonalEventConfig;
    private botValues: IBots;
    private locationValues: ILocations;
    private readonly eventConfig: EventConfig = eventConfig;
    private eventSubConfigs: EventSubConfigs;
    private readonly coreEventNames: string[] = [];
    private readonly additiveEventNames: string[] = [];

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        super(container, db, logger);
    }

    public preInitialize(): void {
        this.eventValues = this.configServer.getConfig(
            ConfigTypes.SEASONAL_EVENT,
        );

        this.eventValues.enableSeasonalEventDetection = false;
        for (let event of this.eventValues.events) event.enabled = false;
    }

    public initialize(): void {
        const { globals, bots, locations } = this.databaseServer.getTables();
        this.globalValues = globals;
        this.botValues = bots;
        this.locationValues = locations;

        this.eventSubConfigs = {
            gear:
                this.Utilities.loadConfigs("event/bots/gear", this.logger) ??
                [],
            hostility:
                this.Utilities.loadConfigs(
                    "event/bots/hostility",
                    this.logger,
                ) ?? [],
            spawns: {
                general:
                    this.Utilities.loadConfigs(
                        "event/bots/spawns/general",
                        this.logger,
                    ) ?? [],
                santa:
                    this.Utilities.loadConfigs(
                        "event/bots/spawns/santa",
                        this.logger,
                    ) ?? [],
                summon:
                    this.Utilities.loadConfigs(
                        "event/bots/spawns/summon",
                        this.logger,
                    ) ?? [],
                zombies:
                    this.Utilities.loadConfigs(
                        "event/bots/spawns/zombies",
                        this.logger,
                    ) ?? [],
            },
        };

        for (let event in this.eventConfig.core)
            this.coreEventNames.push(event);
        for (let event in this.eventConfig.additive)
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
        this.globalValues.config.EventType = [];
    }

    private resetGifter(): void {
        // Remove spawn data
        for (let location in this.locationValues) {
            const locBase: ILocationBase = this.locationValues[location].base;
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
        for (let diff in this.botValues.types["gifter"].difficulty) {
            this.botValues.types["gifter"].difficulty[diff].Patrol[
                "ITEMSTODROP"
            ] = [];
        }
    }

    private activateZombies(): void {
        this.botValues.core.ACTIVE_HALLOWEEN_ZOMBIES_EVENT = true;
        this.globalValues.config.SeasonActivity.InfectionHalloween.DisplayUIEnabled = true;
        this.globalValues.config.SeasonActivity.InfectionHalloween.Enabled = true;

        this.globalValues.LocationInfection.Interchange = 75;
        this.globalValues.LocationInfection.Lighthouse = 25;
        this.globalValues.LocationInfection.RezervBase = 75;
        this.globalValues.LocationInfection.Sandbox = 50;
        this.globalValues.LocationInfection.Shoreline = 25;
        this.globalValues.LocationInfection.TarkovStreets = 100;
        this.globalValues.LocationInfection.Woods = 25;
        this.globalValues.LocationInfection.bigmap = 50;
        this.globalValues.LocationInfection.factory4 = 100;
        this.globalValues.LocationInfection.laboratory = 100;

        const zombieSpawns = this.eventSubConfigs.spawns.general.filter(
            (config) => config.name === "zombies",
        )[0];

        const hostility = this.eventSubConfigs.hostility.filter(
            (config) => config.name === "zombies",
        )[0];

        const zombieConfig = this.eventSubConfigs.spawns.zombies.filter(
            (config) => config.name === "zombies",
        )[0];

        for (let map in zombieSpawns.config) {
            const currentMap = this.locationValues[map] as ILocation;
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
        //         this.locationValues.woods.base.Events.Halloween2024,
        //         null,
        //         4
        //     )
        // );
    }
}
