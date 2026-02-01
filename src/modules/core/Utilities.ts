// General
import path from "path";
import fs from "fs";
import type { Database } from "../../models/database";
import type { TimeFrameEntry, TimeStampEntry } from "../../models/calendar";
import type { MapNames } from "../../models/common/common";

// SPT
import { ContextVariableType } from "@spt/context/ContextVariableType";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { DependencyContainer } from "tsyringe";
import type { ApplicationContext } from "@spt/context/ApplicationContext";
import type { IGetRaidConfigurationRequestData } from "@spt/models/eft/match/IGetRaidConfigurationRequestData";
import type { WeatherController } from "@spt/controllers/WeatherController";

export default class Utilities {
    private container: DependencyContainer;
    private logger: ILogger;

    constructor(container: DependencyContainer, logger: ILogger) {
        this.container = container;
        this.logger = logger;
    }

    public repeat(count: number, callbackfn: (index: number) => void) {
        for (let i = 0; i < count; i++) callbackfn(i);
    }

    public useChance(target: number): boolean {
        return Math.random() * 100 <= target;
    }

    public genNumberInRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public getIsRaidDayOrNight(): "day" | "night" {
        // Get current raid configuration
        const { timeVariant } = this.container
            .resolve<ApplicationContext>("ApplicationContext")
            .getLatestValue(ContextVariableType.RAID_CONFIGURATION)
            .getValue<IGetRaidConfigurationRequestData>();
        const location = this.getCurrentMap();
        // Consider if factory map is selected
        switch (location) {
            case "factory4_day":
                return "day";
            case "factory4_night":
                return "night";
        }
        // Get and format time
        const time = parseInt(
            this.container
                .resolve<WeatherController>("WeatherController")
                .generate()
                .time.split(":")[0],
        );
        // Calculate exact hour based on current or past difference
        const hour = timeVariant === "PAST" ? (time + 12) % 24 : time;
        // Determine day or night
        return hour >= 7 && hour <= 20 ? "day" : "night";
    }

    public getCurrentMap(): MapNames {
        // Get current raid location
        const { location } = this.container
            .resolve<ApplicationContext>("ApplicationContext")
            .getLatestValue(ContextVariableType.RAID_CONFIGURATION)
            .getValue<IGetRaidConfigurationRequestData>();
        // Conversion to lowercase (map names are camelcase for some reason)
        return location.toLowerCase() as MapNames;
    }

    public inRange(lower: number, upper: number, target: number): boolean {
        return target >= lower && target <= upper;
    }

    public writeDatabase(data: Database): void {
        try {
            fs.writeFileSync(
                path.join(__dirname, "../../../config/database/database.json"),
                JSON.stringify(data, null, 4),
                "utf-8",
            );
        } catch {
            this.logger.error(
                `[DES] Could not write to /config/database/database.json.`,
            );
        }
    }

    public loadConfig<ConfigType>(filePath: string): ConfigType {
        try {
            return JSON.parse(
                fs.readFileSync(
                    path.join(__dirname, `../../../config/${filePath}.json`),
                    "utf-8",
                ),
            );
        } catch {
            this.logger.warning(
                `[DES] Error reading /config/${filePath}.json.`,
            );
        }
    }

    public getFolderNames(subPath: string): string[] {
        let folderNames: string[];
        try {
            folderNames = fs.readdirSync(
                path.join(__dirname, `../../../config/${subPath}`),
                "utf-8",
            );
        } catch {
            this.logger.warning(
                `[DES] Error reading /config/${subPath} directory.`,
            );
        }
        return folderNames;
    }

    public loadConfigs<ConfigType = string>(
        subPath: string,
        blacklist: string[] = [],
        preConfig: ConfigType[] = [],
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
                },
            );
        } catch {
            this.logger.warning(
                `[DES] Error reading /config/${subPath} directory.`,
            );
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
                                `../../../config/${subPath}/${filePath}`,
                            ),
                            "utf-8",
                        ),
                    ),
                );
            }
        } catch {
            this.logger.warning(
                `[DES] Problem reading file: ${filePaths[index]}`,
            );
        }
        return configs;
    }

    public chooseWeight(weights: Record<string, number>): string {
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

    public calcDistribution(
        target: number = 0.5,
        intensity: number = 0,
        min: number = 0,
        max: number = 1,
    ): number {
        const t = Math.pow(Math.random(), Math.abs(intensity - 1));
        const range = Math.random() > 0.5 ? max - target : min - target;
        return parseFloat((target + range * (1 - t)).toFixed(3));
    }

    public calcPercentageOfWeights(
        weights: Record<string, number>,
        chosenWeight: string,
    ): string {
        let total = 0;
        for (let key in weights) total += weights[key];
        return ((weights[chosenWeight] / total) * 100).toFixed(2);
    }

    public checkWithinDateRange(
        day: number,
        month: number,
        timeFrame: TimeFrameEntry,
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
