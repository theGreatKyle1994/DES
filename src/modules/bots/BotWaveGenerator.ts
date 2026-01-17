// General
import { mapNames } from "../../models/mod";
import Module from "../core/Module";
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

export default class BotWaveGenerator extends Module {
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

        this.locationConfig.enableBotTypeLimits = false;
        this.locationConfig.addCustomBotWavesToMaps = false;
        this.pmcConfig.removeExistingPmcWaves = true;

        for (let key in this.locationConfig.customWaves)
            for (let type in this.locationConfig.customWaves[key])
                this.locationConfig.customWaves[key][type] = [];

        for (let type in this.pmcConfig.customPmcWaves)
            this.pmcConfig.customPmcWaves[type] = [];

        for (let map of mapNames)
            (this.locations[map] as ILocation).base.BossLocationSpawn = [];
    }

    public enable(): void {
        this.logger.warning(
            JSON.stringify(this.pmcConfig.customPmcWaves, null, 4),
        );
        for (let map of mapNames)
            this.logger.warning(
                JSON.stringify(
                    this.locations[map].base.BossLocationSpawn,
                    null,
                    4,
                ),
            );
    }

    public update(): void {}
}
