// Configs
import modConfig from "../config/config.json";

// General
import { DependencyContainer } from "tsyringe";
import WeatherModule from "./modules/WeatherModule";
import SeasonModule from "./modules/SeasonModule";
import FikaHandler from "./utilities/fikaHandler";

// SPT
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import type { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import type { ConfigServer } from "@spt/servers/ConfigServer";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import type { IEndLocalRaidRequestData } from "@spt/models/eft/match/IEndLocalRaidRequestData";

// Fika
import type { IFikaRaidCreateRequestData } from "@spt/models/fika/routes/raid/create/IFikaRaidCreateRequestData";

class DynamicEnvironmentSystem implements IPreSptLoadMod {
    private _FikaHostHandler = new FikaHandler();
    private _logger: ILogger;
    private _configServer: ConfigServer;
    private _staticRouterModService: StaticRouterModService;
    private _SeasonModule = new SeasonModule();
    private _WeatherModule = new WeatherModule();
    private _weatherSeasonValues: IWeatherConfig;

    public preSptLoad(container: DependencyContainer): void {
        this._logger = container.resolve<ILogger>("WinstonLogger");
        this._configServer = container.resolve<ConfigServer>("ConfigServer");
        this._staticRouterModService =
            container.resolve<StaticRouterModService>("StaticRouterModService");
        this._weatherSeasonValues =
            this._configServer.getConfig<IWeatherConfig>(ConfigTypes.WEATHER);

        if (modConfig.enable) {
            // Enable modules
            this._SeasonModule.enable(this._weatherSeasonValues, this._logger);
            this._WeatherModule.enable(this._weatherSeasonValues, this._logger);

            // Set host UID for config value changing
            this._staticRouterModService.registerStaticRouter(
                "[TWS] /fika/raid/create",
                [
                    {
                        url: "/fika/raid/create",
                        action: async (
                            _,
                            info: IFikaRaidCreateRequestData,
                            ___,
                            output
                        ) => (
                            this._FikaHostHandler.setHost(info.serverId), output
                        ),
                    },
                ],
                "[TWS] /fika/raid/create"
            );

            // Decrement weather and season config values after raid
            this._staticRouterModService.registerStaticRouter(
                "[TWS] /client/match/local/end",
                [
                    {
                        url: "/client/match/local/end",
                        action: async (
                            _,
                            info: IEndLocalRaidRequestData,
                            ___,
                            output
                        ) => {
                            const UID: string = info.results.profile._id;
                            const isHost: boolean =
                                this._FikaHostHandler.isHost(UID);
                            // Only host can modify configs
                            if (
                                modConfig.modules.seasons.enable &&
                                modConfig.modules.seasons.useLength &&
                                isHost
                            )
                                this._SeasonModule.decrementSeason(
                                    this._weatherSeasonValues
                                );
                            if (
                                modConfig.modules.weather.enable &&
                                modConfig.modules.weather.useLength &&
                                isHost
                            )
                                this._WeatherModule.decrementWeather(
                                    this._weatherSeasonValues
                                );
                            return output;
                        },
                    },
                ],
                "[TWS] /client/match/local/end"
            );

            // Generate weather and season values
            this._staticRouterModService.registerStaticRouter(
                "[TWS] /client/weather",
                [
                    {
                        url: "/client/weather",
                        action: async (_, __, ___, output) => {
                            modConfig.modules.seasons.enable &&
                                this._SeasonModule.setSeason(
                                    this._weatherSeasonValues
                                );
                            modConfig.modules.weather.enable &&
                                this._WeatherModule.setWeather(
                                    this._weatherSeasonValues
                                );
                            return output;
                        },
                    },
                ],
                "[TWS] /client/weather"
            );
        } else {
            this._logger.log(
                "[TWS] Mod has been disabled. Check config.",
                LogTextColor.YELLOW
            );
        }
    }
}

module.exports = { mod: new DynamicEnvironmentSystem() };
