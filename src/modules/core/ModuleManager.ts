// Configs
import db from "../../../config/database/database.json";
import modConfig from "../../../config/config.json";

// General
import Utilities from "./Utilities";
import CalendarModule from "../Calendar";
// import EventModule from "../Event";
import SeasonModule from "../Season";
import WeatherModule from "../Weather";
import BotWave from "../bots/BotWave";
import type { ModConfig } from "../../models/mod";
import type { Database } from "../../models/database";

// SPT
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { DependencyContainer } from "tsyringe";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

export default class ModuleManager {
    private readonly modConfig = modConfig as ModConfig;
    protected readonly db: Database = db;
    private readonly Utilities: Utilities;
    private readonly logger: ILogger;
    private readonly Calendar: CalendarModule;
    // private readonly Event: EventModule;
    private readonly Season: SeasonModule;
    private readonly Weather: WeatherModule;
    private readonly BotWave: BotWave;

    constructor(container: DependencyContainer, logger: ILogger) {
        this.logger = logger;
        this.Utilities = new Utilities(container, logger);
        this.Calendar = new CalendarModule(container, this.db, this.logger);
        // this.Event = new EventModule(container, this.db, this.logger);
        this.Season = new SeasonModule(container, this.db, this.logger);
        this.Weather = new WeatherModule(container, this.db, this.logger);
        this.BotWave = new BotWave(container, this.db, this.logger);
    }

    public preSPTConfig(): void {
        // this.Event.preInitialize();
    }

    public postDBConfig(): void {
        // this.Event.initialize();
        this.Season.initialize();
        this.Weather.initialize();
        this.BotWave.initialize();
    }

    public enable(): void {
        this.Calendar.enable();
        // this.Event.enable();
        this.Season.enable();
        this.Weather.enable();
        this.BotWave.enable();
        this.Utilities.writeDatabase(this.db);
        this.logDatabase();
    }

    public update(url: string): void {
        switch (url) {
            case "/client/match/local/end": {
                this.Calendar.update();
                // this.Event.update();
                this.Season.update();
                this.Weather.update();
                this.BotWave.update();
                this.Utilities.writeDatabase(this.db);
                this.logDatabase();
                break;
            }
            case "/client/raid/configuration": {
                this.BotWave.setMapCaps();
                break;
            }
        }
    }

    private logDatabase(): void {
        this.logger.logWithColor(`[DES]`, LogTextColor.MAGENTA);
        this.logger.logWithColor(
            `       Date: ${this.db.date.name.alpha}`,
            LogTextColor.MAGENTA,
        );
        this.logger.logWithColor(
            `       Season: ${this.db.season.name}`,
            LogTextColor.MAGENTA,
        );
        this.logger.logWithColor(
            `       Weather: ${this.db.weather.name}`,
            LogTextColor.MAGENTA,
        );
        // this.logger.logWithColor(
        //     `       Event: ${this.db.event.name}`,
        //     LogTextColor.MAGENTA
        // );
    }
}
