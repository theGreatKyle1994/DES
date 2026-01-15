// General
import path from "path";
import fs from "fs";
import type { Database } from "../../models/database";
import type { TimeFrameEntry, TimeStampEntry } from "../../models/calendar";

// SPT
import type { ILogger } from "@spt/models/spt/utils/ILogger";

export default class Utilities {
    static inRange(lower: number, upper: number, target: number): boolean {
        return target >= lower && target <= upper;
    }

    static writeDatabase(data: Database, logger: ILogger): void {
        try {
            fs.writeFileSync(
                path.join(__dirname, "../../../config/database/database.json"),
                JSON.stringify(data, null, 4),
                "utf-8"
            );
        } catch {
            logger.error(
                `[DES] Could not write to /config/database/database.json.`
            );
        }
    }

    static loadConfig<ConfigType>(
        filePath: string,
        logger: ILogger
    ): ConfigType {
        try {
            return JSON.parse(
                fs.readFileSync(
                    path.join(__dirname, `../../../config/${filePath}.json`),
                    "utf-8"
                )
            );
        } catch {
            logger.warning(`[DES] Error reading /config/${filePath}.json.`);
        }
    }

    static getFolderNames(subPath: string, logger: ILogger): string[] {
        let folderNames: string[];
        try {
            folderNames = fs.readdirSync(
                path.join(__dirname, `../../../config/${subPath}`),
                "utf-8"
            );
        } catch {
            logger.warning(`[DES] Error reading /config/${subPath} directory.`);
        }

        return folderNames;
    }

    static loadConfigs<ConfigType = string>(
        subPath: string,
        logger: ILogger,
        blacklist: string[] = [],
        preConfig: ConfigType[] = []
    ): ConfigType[] {
        let filePaths: string[] = [];
        const configs: ConfigType[] = preConfig;

        // Grab all file paths in config/subPath
        try {
            filePaths = fs.readdirSync(
                path.join(__dirname, `../../../config/${subPath}`),
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

        // Index variable for error tracking
        let index: number = -1;

        // Gather all configs from path array
        try {
            for (let filePath of filePaths) {
                index++;
                configs.push(
                    JSON.parse(
                        fs.readFileSync(
                            path.join(
                                __dirname,
                                `../../../config/${subPath}/${filePath}`
                            ),
                            "utf-8"
                        )
                    )
                );
            }
        } catch {
            logger.warning(`[DES] Problem reading file: ${filePaths[index]}`);
        }

        return configs;
    }

    static chooseWeight(weights: Record<string, number>): string {
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

    static calcPercentageOfWeights(
        weights: Record<string, number>,
        chosenWeight: string
    ): string {
        let total = 0;
        for (let key in weights) total += weights[key];
        return ((weights[chosenWeight] / total) * 100).toFixed(2);
    }

    static checkWithinDateRange(
        day: number,
        month: number,
        timeFrame: TimeFrameEntry
    ): boolean {
        function checkRange(input: number, timeRange: TimeStampEntry): boolean {
            const monthOffset = timeRange.start + timeRange.end - input;
            return timeRange.start > timeRange.end
                ? monthOffset >= timeRange.start || monthOffset <= timeRange.end
                : monthOffset >= timeRange.start &&
                      monthOffset <= timeRange.end;
        }

        return (
            checkRange(month, timeFrame.month) && checkRange(day, timeFrame.day)
        );
    }
}
