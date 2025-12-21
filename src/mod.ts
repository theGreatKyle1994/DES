// Configs
import modConfig from "../config/config.json";

// General
import type { DependencyContainer } from "tsyringe";
import WeatherModule from "./modules/WeatherModule";
import SeasonModule from "./modules/SeasonModule";
import CalendarModule from "./modules/CalendarModule";
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
import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";

class DynamicEnvironmentSystem implements IPreSptLoadMod, IPostDBLoadMod {
    private _FikaHandler = new FikaHandler();
    private _logger: ILogger;
    private _configServer: ConfigServer;
    private _staticRouterModService: StaticRouterModService;
    private _SeasonModule = new SeasonModule();
    private _WeatherModule = new WeatherModule();
    private _CalendarModule = new CalendarModule();
    private _weatherSeasonValues: IWeatherConfig;

    public preSptLoad(container: DependencyContainer): void {
        this._logger = container.resolve<ILogger>("WinstonLogger");
        this._staticRouterModService =
            container.resolve<StaticRouterModService>("StaticRouterModService");

        if (modConfig.enable) {
            // Set host UID for config value changing when fika is enabled
            this._staticRouterModService.registerStaticRouter(
                "[DES] /fika/raid/create",
                [
                    {
                        url: "/fika/raid/create",
                        action: async (
                            _,
                            info: IFikaRaidCreateRequestData,
                            ___,
                            output
                        ) => (this._FikaHandler.setHost(info.serverId), output),
                    },
                ],
                "[DES] /fika/raid/create"
            );

            // Decrement weather and season config values after raid
            this._staticRouterModService.registerStaticRouter(
                "[DES] /client/match/local/end",
                [
                    {
                        url: "/client/match/local/end",
                        action: async (
                            _,
                            info: IEndLocalRaidRequestData,
                            ___,
                            output
                        ) => {
                            // Only host can update database to prevent duplication
                            const UID = info.results.profile._id;
                            const isHost = this._FikaHandler.isHost(UID);

                            // Check if calendar module is enabled
                            if (isHost) {
                                // Check if season module is enabled
                                if (modConfig.modules.seasons.enable) {
                                    if (modConfig.modules.calendar.enable)
                                        this._CalendarModule.incrementCalendar();
                                    else if (
                                        modConfig.modules.seasons.duration
                                            .enable
                                    )
                                        this._SeasonModule.decrementSeason(
                                            this._weatherSeasonValues
                                        );
                                }

                                // Check if weather module is enabled
                                if (
                                    modConfig.modules.weather.enable &&
                                    modConfig.modules.weather.duration.enable
                                )
                                    this._WeatherModule.decrementWeather(
                                        this._weatherSeasonValues
                                    );
                            }

                            return output;
                        },
                    },
                ],
                "[DES] /client/match/local/end"
            );

            // Generate weather and season values
            this._staticRouterModService.registerStaticRouter(
                "[DES] /client/weather",
                [
                    {
                        url: "/client/weather",
                        action: async (_, __, ___, output) => {
                            // Check if season module is enabled
                            modConfig.modules.seasons.enable &&
                                this._SeasonModule.setSeason(
                                    this._weatherSeasonValues
                                );

                            // Check if weather module is enabled
                            modConfig.modules.weather.enable &&
                                this._WeatherModule.setWeather(
                                    this._weatherSeasonValues
                                );

                            return output;
                        },
                    },
                ],
                "[DES] /client/weather"
            );
        } else {
            this._logger.log(
                "[DES] Mod has been disabled. Check config.",
                LogTextColor.YELLOW
            );
        }
    }

    public postDBLoad(container: DependencyContainer): void {
        // Grab initial server config values
        this._configServer = container.resolve<ConfigServer>("ConfigServer");
        this._weatherSeasonValues =
            this._configServer.getConfig<IWeatherConfig>(ConfigTypes.WEATHER);

        // Enable modules
        if (modConfig.enable) {
            this._SeasonModule.enable(this._weatherSeasonValues, this._logger);
            this._WeatherModule.enable(this._weatherSeasonValues, this._logger);
            this._CalendarModule.enable(this._SeasonModule, this._logger);
        }
    }
}

module.exports = { mod: new DynamicEnvironmentSystem() };
