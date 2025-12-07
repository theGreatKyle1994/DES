// Configs
import modConfig from "../config/config.json";

// General Imports
import { DependencyContainer } from "tsyringe";
import Utils from "./utils";

// SPT Imports
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import type { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import type { ConfigServer } from "@spt/servers/ConfigServer";
import type { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

class TarkovWeatherSystem implements IPreSptLoadMod {
  public logger: ILogger;
  public configServer: ConfigServer;
  public staticRouterModService: StaticRouterModService;
  public utils = new Utils();
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
      this.utils.enable(this.weatherSeasonValues, this.logger);
    } else {
      this.logger.log(
        "[TWS] Mod has been disabled. Check config.",
        LogTextColor.YELLOW
      );
    }

    if (modConfig.enable) {
      // Set season and weather during client/game/keepalive callback
      this.staticRouterModService.registerStaticRouter(
        "[TWS] /client/game/keepalive",
        [
          {
            url: "/client/game/keepalive",
            action: async (_url, _, __, output) => {
              // if (modConfig.enableWeather) {
              //   this.utils.setWeather(this.weatherSeasonValues);
              // }
              // if (modConfig.enableSeasons) {
              //   this.utils.setSeason(this.weatherSeasonValues);
              // }
              return output;
            },
          },
        ],
        "[TWS] /client/game/keepalive"
      );
      // Set season during client/match/local/end callback
      modConfig.enableSeasons &&
        this.staticRouterModService.registerStaticRouter(
          "[TWS] /client/match/local/end",
          [
            {
              url: "/client/match/local/end",
              action: async (_url, _, __, output) => {
                // this.utils.setSeason(this.weatherSeasonValues);
                return output;
              },
            },
          ],
          "[TWS] /client/match/local/end"
        );
      // Set weather during client/weather callback
      modConfig.enableWeather &&
        this.staticRouterModService.registerStaticRouter(
          "[TWS] /client/weather",
          [
            {
              url: "/client/weather",
              action: async (_url, _, __, output) => {
                this.utils.setWeather(this.weatherSeasonValues);
                return output;
              },
            },
          ],
          "[TWS] /client/weather"
        );
    }
  }
}

module.exports = { mod: new TarkovWeatherSystem() };
