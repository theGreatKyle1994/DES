// Configs
import modConfig from "../config/config.json";

// General Imports
import { DependencyContainer } from "tsyringe";
import WeatherSystem from "./weatherSystem";
import FikaHandler from "./utilities/fikaHandler";
import { checkModConfig } from "./validation/validationUtilities";

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
  public WeatherSystem = new WeatherSystem();
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

    // Validate mod config is good before initializing mod
    checkModConfig(modConfig, this.logger);

    if (modConfig.enable) {
      // Initialize core mod
      this.WeatherSystem.enable(this.weatherSeasonValues, this.logger);
      // Add clients to list for future use
      this.staticRouterModService.registerStaticRouter(
        "[TWS] /client/game/profile/select",
        [
          {
            url: "/client/game/profile/select",
            action: async (_, info: IUIDRequestData, ___, output) => (
              this.FikaHostHandler.addClient(info.uid), output
            ),
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
            ) => (this.FikaHostHandler.setHost(info.serverId), output),
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
            action: async (_, info: IEndLocalRaidRequestData, ___, output) => {
              const UID: string = info.results.profile._id;
              const isHost: boolean = this.FikaHostHandler.isHost(UID);
              // Only host can modify configs
              if (modConfig.enableSeasons && isHost)
                this.WeatherSystem.decrementSeason(this.weatherSeasonValues);
              if (modConfig.enableWeather && isHost)
                this.WeatherSystem.decrementWeather(this.weatherSeasonValues);
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
              modConfig.enableSeasons &&
                this.WeatherSystem.setSeason(this.weatherSeasonValues);
              modConfig.enableWeather &&
                this.WeatherSystem.setWeather(this.weatherSeasonValues);
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
