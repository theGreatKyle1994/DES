// Configs
import modConfig from "../config/config.json";

// General
import ModuleManager from "./modules/core/ModuleManager";
import FikaHandler from "./utilities/fikaHandler";
import type { ModConfig } from "./models/mod";

// SPT
import { RouteAction } from "@spt/di/Router";
import type { DependencyContainer } from "tsyringe";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import type { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import type { IEndLocalRaidRequestData } from "@spt/models/eft/match/IEndLocalRaidRequestData";

// Fika
import type { IFikaRaidCreateRequestData } from "@spt/models/fika/routes/raid/create/IFikaRaidCreateRequestData";

class DynamicEnvironmentSystem implements IPreSptLoadMod, IPostDBLoadMod {
    private logger: ILogger;
    private readonly modConfig = modConfig as ModConfig;
    private staticRouterModService: StaticRouterModService;
    private ModuleManager: ModuleManager;
    private FikaHandler = new FikaHandler();

    public preSptLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");

        if (modConfig.enable) {
            this.ModuleManager = new ModuleManager(container, this.logger);
            this.ModuleManager.preSPTConfig();

            this.staticRouterModService =
                container.resolve<StaticRouterModService>(
                    "StaticRouterModService",
                );

            this.staticRouterModService.registerStaticRouter(
                "des/routes",
                [
                    new RouteAction(
                        "/fika/raid/create",
                        async (
                            _,
                            info: IFikaRaidCreateRequestData,
                            ___,
                            output,
                        ) => (this.FikaHandler.setHost(info.serverId), output),
                    ),
                    new RouteAction(
                        "/client/match/local/end",
                        async (
                            url: string,
                            info: IEndLocalRaidRequestData,
                            ___,
                            output,
                        ) => (
                            this.FikaHandler.isHost(info.results.profile._id) &&
                                this.ModuleManager.update(url),
                            output
                        ),
                    ),
                    new RouteAction(
                        "/client/raid/configuration",
                        async (url: string, __, ___, output) => (
                            this.ModuleManager.update(url),
                            output
                        ),
                    ),
                ],
                "des",
            );
        } else
            this.logger.warning("[DES] Mod has been disabled. Check config.");
    }

    public postDBLoad(): void {
        if (modConfig.enable) {
            this.ModuleManager.postDBConfig();
            this.ModuleManager.enable();
        }
    }
}

module.exports = { mod: new DynamicEnvironmentSystem() };
