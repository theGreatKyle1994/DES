// Configs
import db from "../../../config/database/database.json";

// General
import Utilities from "./Utilities";
import CalendarModule from "../Calendar";
import EventModule from "../Event";
import SeasonModule from "../Season";
import WeatherModule from "../Weather";
import BotWaveGenerator from "../bots/BotWaveGenerator";
import type { ModConfig } from "../../models/mod";
import type { Database } from "../../models/database";

// SPT
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { DependencyContainer } from "tsyringe";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

export default class ModuleManager {
    protected readonly db: Database = db;
    private readonly logger: ILogger;
    private readonly modConfig: ModConfig;
    private readonly Calendar: CalendarModule;
    private readonly Event: EventModule;
    private readonly Season: SeasonModule;
    private readonly Weather: WeatherModule;
    private readonly BotWaveGenerator: BotWaveGenerator;

    constructor(
        container: DependencyContainer,
        modConfig: ModConfig,
        logger: ILogger,
    ) {
        this.logger = logger;
        this.modConfig = modConfig;

        this.Calendar = new CalendarModule(container, this.db, this.logger);
        this.Event = new EventModule(container, this.db, this.logger);
        this.Season = new SeasonModule(container, this.db, this.logger);
        this.Weather = new WeatherModule(container, this.db, this.logger);
        this.BotWaveGenerator = new BotWaveGenerator(
            container,
            this.db,
            this.logger,
        );
    }

    public preSPTConfig(): void {
        // this.Event.preInitialize();
    }

    public postDBConfig(): void {
        // this.Event.initialize();
        this.Season.initialize();
        this.Weather.initialize();
        this.BotWaveGenerator.initialize();
    }

    public enable(): void {
        this.Calendar.enable();
        // this.Event.enable();
        this.Season.enable();
        this.Weather.enable();
        this.BotWaveGenerator.enable();
        Utilities.writeDatabase(this.db, this.logger);
        this.logDatabase();
    }

    public update(url: string): void {
        switch (url) {
            case "/client/match/local/end": {
                this.Calendar.update();
                // this.Event.update();
                this.Season.update();
                this.Weather.update();
                this.BotWaveGenerator.update();
                Utilities.writeDatabase(this.db, this.logger);
                this.logDatabase();
                break;
            }
            case "/client/raid/configuration": {
                this.BotWaveGenerator.setMapCaps();
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
