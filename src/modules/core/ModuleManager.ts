// Configs
import db from "../../../config/database/database.json";

// General
import Utilities from "./Utilities";
import CalendarModule from "../Calendar";
import EventModule from "../Event";
import SeasonModule from "../Season";
import WeatherModule from "../Weather";
import type { ModConfig } from "../../models/mod";
import type { GameConfigs } from "../../models/mod";
import type { Database } from "../../models/database";

// SPT
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { DependencyContainer } from "tsyringe";
import type { DatabaseService } from "@spt/services/DatabaseService";
import type { ConfigServer } from "@spt/servers/ConfigServer";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

export default class ModuleManager {
    protected readonly _db: Database = db;
    private readonly _logger: ILogger;
    private readonly _modConfig: ModConfig;
    private readonly _gameConfigs: GameConfigs;
    private readonly _Calendar: CalendarModule;
    private readonly _Event: EventModule;
    private readonly _Season: SeasonModule;
    private readonly _Weather: WeatherModule;

    constructor(
        container: DependencyContainer,
        modConfig: ModConfig,
        logger: ILogger
    ) {
        this._logger = logger;
        this._modConfig = modConfig;
        this._gameConfigs = {
            database: container.resolve<DatabaseService>("DatabaseService"),
            configs: container.resolve<ConfigServer>("ConfigServer"),
        };

        this._Calendar = new CalendarModule(
            this._gameConfigs,
            this._db,
            this._logger
        );
        // this._Event = new EventModule(
        //     this._gameConfigs,
        //     this._db,
        //     this._logger
        // );
        this._Season = new SeasonModule(
            this._gameConfigs,
            this._db,
            this._logger
        );
        this._Weather = new WeatherModule(
            this._gameConfigs,
            this._db,
            this._logger
        );
    }

    public preSPTConfig(): void {
        // this._Event.preInitialize();
    }

    public postDBConfig(): void {
        // this._Event.initialize();
        this._Season.initialize();
        this._Weather.initialize();
    }

    public enable(): void {
        this._Calendar.enable();
        // this._Event.enable();
        this._Season.enable();
        this._Weather.enable();
        Utilities.writeDatabase(this._db, this._logger);
        this.logDatabase();
    }

    public update(): void {
        this._Calendar.update();
        // this._Event.update();
        this._Season.update();
        this._Weather.update();
        Utilities.writeDatabase(this._db, this._logger);
        this.logDatabase();
    }

    private logDatabase(): void {
        this._logger.logWithColor(`[DES]`, LogTextColor.MAGENTA);
        this._logger.logWithColor(
            `       Date: ${this._db.date.name.alpha}`,
            LogTextColor.MAGENTA
        );
        this._logger.logWithColor(
            `       Season: ${this._db.season.name}`,
            LogTextColor.MAGENTA
        );
        this._logger.logWithColor(
            `       Weather: ${this._db.weather.name}`,
            LogTextColor.MAGENTA
        );
        // this._logger.logWithColor(
        //     `       Event: ${this._db.event.name}`,
        //     LogTextColor.MAGENTA
        // );
    }
}
