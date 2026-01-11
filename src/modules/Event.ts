// Configs
import eventConfig from "../../config/event/events.json";

// General
import Module from "./core/Module";
import type { GameConfigs } from "../models/mod";
import type { EventConfig } from "../models/event";
import type { Database } from "../models/database";

// SPT
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ISeasonalEventConfig } from "@spt/models/spt/config/ISeasonalEventConfig";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IGlobals } from "@spt/models/eft/common/IGlobals";
import type { IBots } from "@spt/models/spt/bots/IBots";
import type { ILocations } from "@spt/models/spt/server/ILocations";
import type { ILocationBase } from "@spt/models/eft/common/ILocationBase";

export default class EventModule extends Module {
    private _globalValues: IGlobals;
    private _eventValues: ISeasonalEventConfig;
    private _botValues: IBots;
    private _locationValues: ILocations;
    private readonly _eventConfig: EventConfig = eventConfig;
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

        for (let event in this._eventConfig.core)
            this._coreEventNames.push(event);
        for (let event in this._eventConfig.additive)
            this._additiveEventNames.push(event);
    }

    public enable(): void {
        this._logger.success(
            JSON.stringify(this._eventValues.eventWaves, null, 4)
        );

        this.removeEventData();
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
}
