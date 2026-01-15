// Configs
import modConfig from "../config/config.json";

// General
import ModuleManager from "./modules/core/ModuleManager";
import FikaHandler from "./utilities/fikaHandler";

// SPT
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
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
    private _logger: ILogger;
    private _staticRouterModService: StaticRouterModService;
    private _ModuleManager: ModuleManager;
    private _FikaHandler = new FikaHandler();

    public preSptLoad(container: DependencyContainer): void {
        this._logger = container.resolve<ILogger>("WinstonLogger");

        if (modConfig.enable) {
            this._ModuleManager = new ModuleManager(
                container,
                modConfig,
                this._logger
            );
            this._ModuleManager.preSPTConfig();

            this._staticRouterModService =
                container.resolve<StaticRouterModService>(
                    "StaticRouterModService"
                );

            this._staticRouterModService.registerStaticRouter(
                "[DES] /routes",
                [
                    new RouteAction(
                        "/fika/raid/create",
                        async (
                            _,
                            info: IFikaRaidCreateRequestData,
                            ___,
                            output
                        ) => (this._FikaHandler.setHost(info.serverId), output)
                    ),
                    new RouteAction(
                        "/client/match/local/end",
                        async (
                            _,
                            info: IEndLocalRaidRequestData,
                            ___,
                            output
                        ) => (
                            this._FikaHandler.isHost(
                                info.results.profile._id
                            ) && this._ModuleManager.update(),
                            output
                        )
                    ),
                ],
                "[DES] /routes"
            );
        } else
            this._logger.logWithColor(
                "[DES] Mod has been disabled. Check config.",
                LogTextColor.YELLOW
            );
    }

    public postDBLoad(): void {
        if (modConfig.enable) {
            this._ModuleManager.postDBConfig();
            this._ModuleManager.enable();
        }
    }
}

module.exports = { mod: new DynamicEnvironmentSystem() };
