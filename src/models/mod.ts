export interface ModConfig {
  enable: boolean;
  enableSeasons: boolean;
  enableWeather: boolean;
  randomSeasons: boolean;
  fikaAdjustmentID: string;
}

export const modConfigDefaults = {
  enable: true,
  enableSeasons: true,
  enableWeather: true,
  randomSeasons: false,
  fikaAdjustmentID: "",
};
