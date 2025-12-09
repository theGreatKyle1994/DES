// Configs
import modConfig from "../config/config.json";

// General Imports
import { DependencyContainer } from "tsyringe";
import WeatherSystem from "./weatherSystem";
import { checkModConfig } from "./validation/validationUtilities";
import { writeConfig } from "./utilities/utils";

// SPT Imports
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import type { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import type { ConfigServer } from "@spt/servers/ConfigServer";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import type { IGetBodyResponseData } from "@spt/models/eft/httpResponse/IGetBodyResponseData";
import type { IPmcData } from "@spt/models/eft/common/IPmcData";

class TarkovWeatherSystem implements IPreSptLoadMod {
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
      this.staticRouterModService.registerStaticRouter(
        "[TWS] /client/game/profile/list",
        [
          {
            url: "/client/game/profile/list",
            action: async (_, __, ___, output) => {
              // const outputData = JSON.parse(output) as IGetBodyResponseData<
              //   IPmcData[]
              // >;
              // const sessionID = outputData.data[0].sessionId;
              // modConfig.fikaAdjustmentID = sessionID;
              // writeConfig(modConfig, "config", this.logger);
              return output;
            },
          },
        ],
        "[TWS] /client/game/profile/list"
      );
      this.staticRouterModService.registerStaticRouter(
        "[TWS] /fika/raid/create",
        [
          {
            url: "/fika/raid/create",
            action: async (_, info, ___, output) => {
              // const data = JSON.parse(info) as { serverId: string };
              // this.WeatherSystem.fikaID = data.serverId;
              return output;
            },
          },
        ],
        "[TWS] /fika/raid/create"
      );
      this.staticRouterModService.registerStaticRouter(
        "[TWS] /client/match/local/end",
        [
          {
            url: "/client/match/local/end",
            action: async (_, __, ___, output) => {
              modConfig.enableSeasons &&
                this.WeatherSystem.decrementSeason(this.weatherSeasonValues);
              modConfig.enableWeather &&
                this.WeatherSystem.decrementWeather(this.weatherSeasonValues);
              return output;
            },
          },
        ],
        "[TWS] /client/match/local/end"
      );
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
    } else
      this.logger.log(
        "[TWS] Mod has been disabled. Check config.",
        LogTextColor.YELLOW
      );
  }
}

module.exports = { mod: new TarkovWeatherSystem() };
