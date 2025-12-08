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
    logger.success(`[TWS] Successfully updated ${fileName}.json.`);
  } catch {
    logger.error(`[TWS] Could not write to /config/${fileName}.json.`);
  }
}

export function chooseWeight(weights: Object): string {
  // Calculate total weight of season weather types
  let totalWeight = 0;
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
