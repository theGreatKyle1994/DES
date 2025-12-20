// General
import type { WeatherWeightsConfig } from "../models/weather";
import type { Database } from "../models/database";
import path from "path";
import fs from "fs/promises";

// SPT
import type { ILogger } from "@spt/models/spt/utils/ILogger";

export async function writeDatabase(
    data: object,
    dbIndex: string,
    logger: ILogger
): Promise<void> {
    // Get previous db info
    const prevDB: Database = await loadConfig<Database>(logger, "db/database");
    // Merge old db with updated db
    const currentDB: Database = { ...prevDB, [dbIndex]: data };
    // Write new db data to file
    try {
        await fs.writeFile(
            path.join(__dirname, "../../config/db/database.json"),
            JSON.stringify(currentDB, null, 2)
        );
    } catch {
        logger.error(`[DES] Could not write to /config/db/database.json.`);
    }
}

export async function loadConfig<ConfigType>(
    logger: ILogger,
    filePath: string
): Promise<ConfigType> {
    // Grab config in config/subPath
    try {
        return JSON.parse(
            await fs.readFile(
                path.join(__dirname, `../../config/${filePath}.json`),
                {
                    encoding: "utf-8",
                }
            )
        );
    } catch {
        logger.warning(`[DES] Error reading /config/${filePath}.json.`);
    }
}

export async function loadConfigs<ConfigType = string>(
    logger: ILogger,
    subPath: string,
    blacklist: string[] = [],
    preConfig: ConfigType[] = []
): Promise<ConfigType[]> {
    let filePaths: string[] = [];
    let configs: ConfigType[] = preConfig;

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
    } catch {
        logger.warning(`[DES] Error reading /config/${subPath} directory.`);
    }

    // Remove blacklisted items from list
    for (let blItem of blacklist)
        if (filePaths.includes(blItem))
            filePaths.splice(filePaths.indexOf(blItem), 1);

    // Index variale for error tracking
    let index: number = -1;
    // Gather all configs from path array
    try {
        for (let filePath of filePaths) {
            index++;
            configs.push(
                JSON.parse(
                    await fs.readFile(
                        path.join(
                            __dirname,
                            `../../config/${subPath}/${filePath}`
                        ),
                        { encoding: "utf-8" }
                    )
                )
            );
        }
    } catch {
        logger.warning(`[DES] Problem reading file: ${filePaths[index]}`);
    }

    return configs;
}

export async function loadWeights(
    logger: ILogger,
    subPath: string,
    weights: WeatherWeightsConfig = {
        SUMMER: {},
        AUTUMN: {},
        WINTER: {},
        SPRING: {},
        AUTUMN_LATE: {},
        SPRING_EARLY: {},
    }
): Promise<WeatherWeightsConfig> {
    let weightsConfig: WeatherWeightsConfig;
    try {
        // Get weight config based on sub folder
        weightsConfig = JSON.parse(
            await fs.readFile(
                path.join(__dirname, `../../config/${subPath}/weights.json`),
                {
                    encoding: "utf-8",
                }
            )
        );

        // Add config values to weight config
        weights = {
            SUMMER: { ...weights.SUMMER, ...weightsConfig.SUMMER },
            AUTUMN: { ...weights.AUTUMN, ...weightsConfig.AUTUMN },
            WINTER: { ...weights.WINTER, ...weightsConfig.WINTER },
            SPRING: { ...weights.SPRING, ...weightsConfig.SPRING },
            AUTUMN_LATE: {
                ...weights.AUTUMN_LATE,
                ...weightsConfig.AUTUMN_LATE,
            },
            SPRING_EARLY: {
                ...weights.SPRING_EARLY,
                ...weightsConfig.SPRING_EARLY,
            },
        };

        return weights;
    } catch (err) {
        logger.warning(`[DES] Could not load: ${subPath}/weights.json.`);
    }
}

export function chooseWeight(weights: Object): string {
    let totalWeight = 0;

    // Calculate total weight
    for (let key in weights) {
        totalWeight += weights[key];
    }

    // Determine random weight choice
    const cursor = Math.ceil(Math.random() * totalWeight);
    let total = 0;

    for (let key in weights) {
        total += weights[key];
        if (total >= cursor) return key;
    }
}
