// Configs
import eventConfig from "../../config/event/events.json";

// General
import Module from "./core/Module";
import type { GameConfigs } from "../models/mod";
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

export default class EventModule extends Module {
    private _globalValues: IGlobals;
    private _eventValues: ISeasonalEventConfig;
    private _botValues: IBots;
    private _locationValues: ILocations;
    private readonly _eventConfig: EventConfig = eventConfig;
    private _eventSubConfigs: EventSubConfigs;
    private readonly _coreEventNames: string[] = [];
    private readonly _additiveEventNames: string[] = [];

    constructor(configs: GameConfigs, db: Database, logger: ILogger) {
        super(configs, db, logger);
    }

    public preInitialize(): void {
        this._eventValues = this._gameConfigs.configs.getConfig(
            ConfigTypes.SEASONAL_EVENT
        );

        this._eventValues.enableSeasonalEventDetection = false;
        for (let event of this._eventValues.events) event.enabled = false;
    }

    public initialize(): void {
        this._globalValues = this._gameConfigs.database.getGlobals();
        this._botValues = this._gameConfigs.database.getBots();
        this._locationValues = this._gameConfigs.database.getLocations();
        this._eventSubConfigs = {
            gear:
                this.Utilities.loadConfigs("event/bots/gear", this._logger) ??
                [],
            hostility:
                this.Utilities.loadConfigs(
                    "event/bots/hostility",
                    this._logger
                ) ?? [],
            spawns: {
                general:
                    this.Utilities.loadConfigs(
                        "event/bots/spawns/general",
                        this._logger
                    ) ?? [],
                santa:
                    this.Utilities.loadConfigs(
                        "event/bots/spawns/santa",
                        this._logger
                    ) ?? [],
                summon:
                    this.Utilities.loadConfigs(
                        "event/bots/spawns/summon",
                        this._logger
                    ) ?? [],
                zombies:
                    this.Utilities.loadConfigs(
                        "event/bots/spawns/zombies",
                        this._logger
                    ) ?? [],
            },
        };

        for (let event in this._eventConfig.core)
            this._coreEventNames.push(event);
        for (let event in this._eventConfig.additive)
            this._additiveEventNames.push(event);
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
        this._globalValues.config.EventType = [];
    }

    private resetGifter(): void {
        // Remove spawn data
        for (let location in this._locationValues) {
            const locBase: ILocationBase = this._locationValues[location].base;
            if (locBase?.BossLocationSpawn) {
                for (let boss of locBase.BossLocationSpawn) {
                    if (boss.BossName === "gifter") {
                        locBase?.BossLocationSpawn.splice(
                            locBase?.BossLocationSpawn.indexOf(boss),
                            1
                        );
                    }
                }
            }
        }
        // Remove any item drop data
        for (let diff in this._botValues.types["gifter"].difficulty) {
            this._botValues.types["gifter"].difficulty[diff].Patrol[
                "ITEMS_TO_DROP"
            ] = [];
        }
    }

    private activateZombies(): void {
        this._botValues.core.ACTIVE_HALLOWEEN_ZOMBIES_EVENT = true;
        this._globalValues.config.SeasonActivity.InfectionHalloween.DisplayUIEnabled =
            true;
        this._globalValues.config.SeasonActivity.InfectionHalloween.Enabled =
            true;

        this._globalValues.LocationInfection.Interchange = 75;
        this._globalValues.LocationInfection.Lighthouse = 25;
        this._globalValues.LocationInfection.RezervBase = 75;
        this._globalValues.LocationInfection.Sandbox = 50;
        this._globalValues.LocationInfection.Shoreline = 25;
        this._globalValues.LocationInfection.TarkovStreets = 100;
        this._globalValues.LocationInfection.Woods = 25;
        this._globalValues.LocationInfection.bigmap = 50;
        this._globalValues.LocationInfection.factory4 = 100;
        this._globalValues.LocationInfection.laboratory = 100;

        const zombieSpawns = this._eventSubConfigs.spawns.general.filter(
            (config) => config.name === "zombies"
        )[0];

        const hostility = this._eventSubConfigs.hostility.filter(
            (config) => config.name === "zombies"
        )[0];

        const zombieConfig = this._eventSubConfigs.spawns.zombies.filter(
            (config) => config.name === "zombies"
        )[0];

        for (let map in zombieSpawns.config) {
            const currentMap = this._locationValues[map] as ILocation;
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

        // this._logger.success(
        //     JSON.stringify(
        //         this._locationValues.woods.base.Events.Halloween2024,
        //         null,
        //         4
        //     )
        // );
    }
}
