// Configs
import modConfig from "../config/config.json";

// General Imports
import { DependencyContainer } from "tsyringe";
import WeatherModule from "./modules/WeatherModule";
import SeasonModule from "./modules/SeasonModule";
import FikaHandler from "./utilities/fikaHandler";

// SPT Imports
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import type { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import type { ConfigServer } from "@spt/servers/ConfigServer";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import type { IUIDRequestData } from "@spt/models/eft/common/request/IUIDRequestData";
import type { IEndLocalRaidRequestData } from "@spt/models/eft/match/IEndLocalRaidRequestData";

// Fika Imports
import type { IFikaRaidCreateRequestData } from "@spt/models/fika/routes/raid/create/IFikaRaidCreateRequestData";

class TarkovWeatherSystem implements IPreSptLoadMod {
    public FikaHostHandler = new FikaHandler();
    public logger: ILogger;
    public configServer: ConfigServer;
    public staticRouterModService: StaticRouterModService;
    public SeasonModule = new SeasonModule();
    public WeatherModule = new WeatherModule();
    public weatherSeasonValues: IWeatherConfig;

    public preSptLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.configServer = container.resolve<ConfigServer>("ConfigServer");
        this.staticRouterModService = container.resolve<StaticRouterModService>(
            "StaticRouterModService"
        );
        this.weatherSeasonValues = this.configServer.getConfig<IWeatherConfig>(
            ConfigTypes.WEATHER
        );

        if (modConfig.enable) {
            // Enable modules
            this.SeasonModule.enable(this.weatherSeasonValues, this.logger);
            this.WeatherModule.enable(this.weatherSeasonValues, this.logger);

            // Add clients to list for future use
            this.staticRouterModService.registerStaticRouter(
                "[TWS] /client/game/profile/select",
                [
                    {
                        url: "/client/game/profile/select",
                        action: async (
                            _,
                            info: IUIDRequestData,
                            ___,
                            output
                        ) => (this.FikaHostHandler.addClient(info.uid), output),
                    },
                ],
                "[TWS] /client/game/profile/select"
            );

            // Set host UID for config value changing
            this.staticRouterModService.registerStaticRouter(
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
                            this.FikaHostHandler.setHost(info.serverId), output
                        ),
                    },
                ],
                "[TWS] /fika/raid/create"
            );

            // Decrement weather and season config values after raid
            this.staticRouterModService.registerStaticRouter(
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
                                this.FikaHostHandler.isHost(UID);
                            // Only host can modify configs
                            if (
                                modConfig.modules.seasons.enable &&
                                modConfig.modules.seasons.useLength &&
                                isHost
                            )
                                this.SeasonModule.decrementSeason(
                                    this.weatherSeasonValues
                                );
                            if (
                                modConfig.modules.weather.enable &&
                                modConfig.modules.weather.useLength &&
                                isHost
                            )
                                this.WeatherModule.decrementWeather(
                                    this.weatherSeasonValues
                                );
                            return output;
                        },
                    },
                ],
                "[TWS] /client/match/local/end"
            );

            // Generate weather and season values
            this.staticRouterModService.registerStaticRouter(
                "[TWS] /client/weather",
                [
                    {
                        url: "/client/weather",
                        action: async (_, __, ___, output) => {
                            modConfig.modules.seasons.enable &&
                                this.SeasonModule.setSeason(
                                    this.weatherSeasonValues
                                );
                            modConfig.modules.weather.enable &&
                                this.WeatherModule.setWeather(
                                    this.weatherSeasonValues
                                );
                            return output;
                        },
                    },
                ],
                "[TWS] /client/weather"
            );
        } else {
            this.logger.log(
                "[TWS] Mod has been disabled. Check config.",
                LogTextColor.YELLOW
            );
        }
    }
}

module.exports = { mod: new TarkovWeatherSystem() };
