// Configs
import db from "../../../config/database/database.json";
import modConfig from "../../../config/config.json";

// General
import Utilities from "./Utilities";
import type { Database } from "../../models/database";

// SPT
import type { DependencyContainer } from "tsyringe";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { ConfigServer } from "@spt/servers/ConfigServer";
import type { DatabaseServer } from "@spt/servers/DatabaseServer";
import type { ModConfig } from "../../models/mod";

export default abstract class Module {
    protected readonly Utilities: Utilities;
    protected readonly container: DependencyContainer;
    protected readonly configServer: ConfigServer;
    protected readonly databaseServer: DatabaseServer;
    protected readonly logger: ILogger;
    protected readonly modConfig = modConfig as ModConfig;
    protected db: Database = db;

    constructor(container: DependencyContainer, db: Database, logger: ILogger) {
        this.container = container;
        this.configServer =
            this.container.resolve<ConfigServer>("ConfigServer");
        this.databaseServer =
            this.container.resolve<DatabaseServer>("DatabaseServer");
        this.Utilities = new Utilities(container, logger);
        this.db = db;
        this.logger = logger;
    }

    public preInitialize(): void {}
    public initialize(): void {}
    public abstract enable(): void;
    public abstract update(): void;

    protected logDebug(input: any): void {
        this.logger.warning(JSON.stringify(input, null, 4));
    }
}
