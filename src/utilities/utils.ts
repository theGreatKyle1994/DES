// General Imports
import path from "path";
import fs from "fs/promises";

// SPT Imports
import type { ILogger } from "@spt/models/spt/utils/ILogger";

export async function writeConfig<ConfigType>(
  config: ConfigType,
  fileName: string,
  logger: ILogger
): Promise<void> {
  try {
    await fs.writeFile(
      path.join(__dirname, "../../config/", `${fileName}.json`),
      JSON.stringify(config, null, 2)
    );
  } catch {
    logger.error(`[TWS] Could not write to /config/${fileName}.json.`);
  }
}

export function chooseWeight(weights: Object): string {
  let totalWeight = 0;

  // Calculate total weight of season weather types
  for (let key in weights) {
    totalWeight += weights[key];
  }

  // Determine random weather choice
  const cursor = Math.ceil(Math.random() * totalWeight);
  let total = 0;

  for (let key in weights) {
    total += weights[key];
    if (total >= cursor) return key;
  }
}

export async function loadConfigs<T = string>(
  subPath: string,
  logger: ILogger
): Promise<T[]> {
  let filePaths: string[] = [];
  let configs: T[] = [];

  // Grab all file paths in config/subPath
  try {
    filePaths = await fs.readdir(
      path.join(__dirname, `../../config/${subPath}`),
      {
        encoding: "utf-8",
        recursive: true,
        withFileTypes: false,
      }
    );
  } catch (err) {
    logger.warning(`[TWS] Error reading /config/${subPath} directory.`);
  }

  // Remove example.json from list
  filePaths = filePaths.filter((path) => path !== "example.json");

  // Index variale for error tracking
  let index: number = -1;
  // Gather all configs from path array
  try {
    for (let filePath of filePaths) {
      index++;
      configs.push(
        JSON.parse(
          await fs.readFile(
            path.join(__dirname, `../../config/${subPath}/${filePath}`),
            { encoding: "utf-8" }
          )
        )
      );
    }
  } catch (err) {
    logger.warning(`[TWS] Problem reading file: ${filePaths[index]}`);
  }

  return configs;
}
