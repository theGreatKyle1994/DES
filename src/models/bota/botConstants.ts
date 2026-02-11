// General
import type { BotWaves, BotZones } from "./bots";

export const wavesConfigDefault = {
    mapGroups: {
        day: {
            Customs: [],
            Factory: [],
            Interchange: [],
            Laboratory: [],
            Lighthouse: [],
            Reserve: [],
            GroundZero: [],
            GroundZeroHigh: [],
            Shoreline: [],
            Streets: [],
            Woods: [],
        },
        night: {
            Customs: [],
            FactoryNight: [],
            Interchange: [],
            Laboratory: [],
            Lighthouse: [],
            Reserve: [],
            GroundZero: [],
            GroundZeroHigh: [],
            Shoreline: [],
            Streets: [],
            Woods: [],
        },
    },
    spawnGroups: {},
};

export const botWavesDefault: BotWaves = {
    dist: {},
    timers: {
        bigmap: { day: {}, night: {} },
        factory4_day: { day: {} },
        factory4_night: { night: {} },
        interchange: { day: {}, night: {} },
        laboratory: { day: {}, night: {} },
        lighthouse: { day: {}, night: {} },
        rezervbase: { day: {}, night: {} },
        sandbox: { day: {}, night: {} },
        sandbox_high: { day: {}, night: {} },
        shoreline: { day: {}, night: {} },
        tarkovstreets: { day: {}, night: {} },
        woods: { day: {}, night: {} },
    },
    spawns: {
        bigmap: { day: [], night: [] },
        factory4_day: { day: [] },
        factory4_night: { night: [] },
        interchange: { day: [], night: [] },
        laboratory: { day: [], night: [] },
        lighthouse: { day: [], night: [] },
        rezervbase: { day: [], night: [] },
        sandbox: { day: [], night: [] },
        sandbox_high: { day: [], night: [] },
        shoreline: { day: [], night: [] },
        tarkovstreets: { day: [], night: [] },
        woods: { day: [], night: [] },
    },
};

export const zoneNames: BotZones = {
    bigmap: {
        zones: {
            general: [
                "ZoneBrige",
                "ZoneCrossRoad",
                "ZoneDormitory",
                "ZoneGasStation",
                "ZoneFactoryCenter",
                "ZoneFactorySide",
                "ZoneOldAZS",
                "ZoneBlockPost",
                "ZoneTankSquare",
                "ZoneWade",
                "ZoneCustoms",
                "ZoneScavBase",
            ],
            sniper: [
                "ZoneSnipeBrige",
                "ZoneSnipeTower",
                "ZoneSnipeFactory",
                "ZoneBlockPostSniper",
            ],
            boss: [
                "ZoneDormitory",
                "ZoneGasStation",
                "ZoneFactorySide",
                "ZoneWade",
                "ZoneCustoms",
                "ZoneScavBase",
            ],
        },
    },
    factory4_day: {
        zones: {
            general: ["BotZone"],
            sniper: [],
            boss: ["BotZone"],
        },
    },
    factory4_night: {
        zones: {
            general: ["BotZone"],
            sniper: [],
            boss: ["BotZone"],
        },
    },
    interchange: {
        zones: {
            general: [
                "ZoneCenter",
                "ZoneCenterBot",
                "ZoneOLI",
                "ZoneIDEA",
                "ZoneRoad",
                "ZoneIDEAPark",
                "ZoneGoshan",
                "ZonePowerStation",
                "ZoneTrucks",
                "ZoneOLIPark",
            ],
            sniper: [],
            boss: [
                "ZoneCenterBot",
                "ZoneIDEA",
                "ZoneCenter",
                "ZoneTrucks",
                "ZoneOLI",
                "ZoneGoshan",
            ],
        },
    },
    laboratory: {
        zones: {
            general: [
                "BotZoneBasement",
                "BotZoneFloor1",
                "BotZoneFloor2",
                "BotZoneGate1",
                "BotZoneGate2",
            ],
            sniper: [],
            boss: [
                "BotZoneBasement",
                "BotZoneFloor1",
                "BotZoneFloor2",
                "BotZoneGate1",
                "BotZoneGate2",
            ],
        },
    },
    lighthouse: {
        zones: {
            general: [
                "Zone_Containers",
                "Zone_Rocks",
                "Zone_Chalet",
                "Zone_Village",
                "Zone_Bridge",
                "Zone_OldHouse",
                "Zone_LongRoad",
                "Zone_DestroyedHouse",
                "Zone_TreatmentContainers",
                "Zone_TreatmentRocks",
                "Zone_TreatmentBeach",
                "Zone_Blockpost",
                "Zone_Hellicopter",
            ],
            sniper: [
                "Zone_RoofBeach",
                "Zone_RoofContainers",
                "Zone_RoofRocks",
                "Zone_SniperPeak",
                "Zone_Island",
            ],
            boss: [
                "Zone_Containers",
                "Zone_Chalet",
                "Zone_Village",
                "Zone_Bridge",
                "Zone_LongRoad",
                "Zone_DestroyedHouse",
                "Zone_Blockpost",
                "Zone_TreatmentRocks",
                "Zone_TreatmentContainers",
                "Zone_TreatmentBeach",
                "Zone_Hellicopter",
            ],
        },
    },
    rezervbase: {
        zones: {
            general: [
                "ZoneRailStrorage",
                "ZonePTOR1",
                "ZonePTOR2",
                "ZoneBarrack",
                "ZoneBunkerStorage",
                "ZoneSubStorage",
                "ZoneSubCommand",
            ],
            sniper: [],
            boss: [
                "ZoneRailStrorage",
                "ZonePTOR1",
                "ZonePTOR2",
                "ZoneBarrack",
                "ZoneSubStorage",
                "ZoneSubCommand",
            ],
        },
    },
    sandbox: {
        zones: {
            general: ["ZoneSandbox"],
            sniper: ["ZoneSandSnipeCenter", "ZoneSandSnipeCenter2"],
            boss: ["ZoneSandbox"],
        },
    },
    sandbox_high: {
        zones: {
            general: ["ZoneSandbox"],
            sniper: ["ZoneSandSnipeCenter", "ZoneSandSnipeCenter2"],
            boss: ["ZoneSandbox"],
        },
    },
    shoreline: {
        zones: {
            general: [
                "ZoneSanatorium1",
                "ZoneSanatorium2",
                "ZoneIsland",
                "ZoneGasStation",
                "ZoneMeteoStation",
                "ZonePowerStation",
                "ZoneBusStation",
                "ZoneRailWays",
                "ZonePort",
                "ZoneForestTruck",
                "ZoneForestSpawn",
                "ZoneSmuglers",
                "ZoneTunnel",
                "ZonePassClose",
                "ZoneBunker",
                "ZoneGreenHouses",
                "ZoneStartVillage",
                "ZoneForestGasStation",
            ],
            sniper: ["ZoneBunkeSniper", "ZonePowerStationSniper"],
            boss: [
                "ZoneGreenHouses",
                "ZonePowerStation",
                "ZonePort",
                "ZoneSanatorium1",
                "ZoneSanatorium2",
                "ZoneMeteoStation",
                "ZoneSmuglers",
            ],
        },
    },
    tarkovstreets: {
        zones: {
            general: [
                "ZoneSW01",
                "ZoneConstruction",
                "ZoneCarShowroom",
                "ZoneCinema",
                "ZoneFactory",
                "ZoneHotel_1",
                "ZoneHotel_2",
                "ZoneConcordia_1",
                "ZoneConcordiaParking",
                "ZoneSW00",
                "ZoneCard1",
                "ZoneStilo",
                "ZoneColumn",
                "ZoneMvd",
                "ZoneClimova",
            ],
            sniper: [
                "ZoneSnipeCinema",
                "ZoneSnipeCarShowroom",
                "ZoneSnipeBuilding",
                "ZoneSnipeSW01",
                "ZoneSnipeStilo",
                "ZoneSnipeCard",
            ],
            boss: [
                "ZoneCarShowroom",
                "ZoneFactory",
                "ZoneHotel_1",
                "ZoneColumn",
                "ZoneSW00",
                "ZoneCard1",
            ],
        },
    },
    woods: {
        zones: {
            general: [
                "ZoneClearVill",
                "ZoneHouse",
                "ZoneScavBase2",
                "ZoneWoodCutter",
                "ZoneBigRocks",
                "ZoneRoad",
                "ZoneMiniHouse",
                "ZoneRedHouse",
                "ZoneDepo",
                "ZoneStoneBunker",
                "ZoneBrokenVill",
                "ZoneUsecBase",
            ],
            sniper: ["ZoneHighRocks"],
            boss: [
                "ZoneWoodCutter",
                "ZoneHouse",
                "ZoneRoad",
                "ZoneRedHouse",
                "ZoneScavBase2",
                "ZoneBrokenVill",
                "ZoneUsecBase",
                "ZoneStoneBunker",
            ],
        },
    },
};

export enum DifficultyNames {
    Easy = "easy",
    Normal = "normal",
    Hard = "hard",
    Impossible = "impossible",
}

export enum BotNames {
    Usec = "pmcUSEC",
    Bear = "pmcBEAR",
    Sniper = "marksman",
    Scav = "assault",
    ScavEvent = "crazyAssaultEvent",
    ScavCursed = "cursedAssault",
    Rogue = "exUsec",
    Raider = "pmcBot",
    Smuggler = "arenaFighterEvent",
    Kaban = "bossBoar",
    KabanSniper = "bossBoarSniper",
    KabanAssault = "followerBoar",
    KabanClose1 = "followerBoarClose1",
    KabanClose2 = "followerBoarClose2",
    Reshala = "bossBully",
    ReshalaAssault = "followerBully",
    Glukhar = "bossGluhar",
    GlukharAssault = "followerGluharAssault",
    GlukharScout = "followerGluharScout",
    GlukharSecurity = "followerGluharSecurity",
    GlukharSniper = "followerGluharSnipe",
    Knight = "bossKnight",
    BigPipe = "followerBigPipe",
    BirdEye = "followerBirdEye",
    Shturman = "bossKojaniy",
    ShturmanAssault = "followerKojaniy",
    Kolontay = "bossKolontay",
    KolontayAssault = "followerKolontayAssault",
    KolontaySecurity = "followerKolontaySecurity",
    Partisan = "bossPartisan",
    Sanitar = "bossSanitar",
    SanitarAssault = "followerSanitar",
    Killa = "bossKilla",
    Tagilla = "bossTagilla",
    TagillaAssault = "followerTagilla",
    Zryachiy = "bossZryachiy",
    ZryachiyAssault = "followerZryachiy",
    CultistPriest = "sectantPriest",
    Cultist = "sectantWarrior",
    CultistOni = "sectantOni",
    CultistPredvestni = "sectantPredvestnik",
    CultistPrizrak = "sectantPrizrak",
}

// export type ZombieNames =
//     | "infectedAssault"
//     | "infectedPmc"
//     | "infectedCivil"
//     | "infectedLaborant"
//     | "infectedtagilla";

// export type BotNames =
//     | "arenaFighter"
//     | "arenaFighterEvent"
//     | "assault"
//     | "bossBoar"
//     | "bossBoarSniper"
//     | "bossBully"
//     | "bossGluhar"
//     | "bossKilla"
//     | "bossKnight"
//     | "bossKojaniy"
//     | "bossKolontay"
//     | "bossPartisan"
//     | "bossSanitar"
//     | "bossTagilla"
//     | "bossZryachiy"
//     | "crazyAssaultEvent"
//     | "exUsec"
//     | "followerBigPipe"
//     | "followerBirdEye"
//     | "followerBoar"
//     | "followerBoarClose1"
//     | "followerBoarClose2"
//     | "followerBully"
//     | "followerGluharAssault"
//     | "followerGluharScout"
//     | "followerGluharSecurity"
//     | "followerGluharSnipe"
//     | "followerKojaniy"
//     | "followerKolontayAssault"
//     | "followerKolontaySecurity"
//     | "followerSanitar"
//     | "followerTagilla"
//     | "followerZryachiy"
//     | "marksman"
//     | "pmcBEAR"
//     | "pmcBot"
//     | "pmcUSEC"
//     | "sectantOni"
//     | "sectantPredvestnik"
//     | "sectantPriest"
//     | "sectantPrizrak"
//     | "sectantWarrior";

// export type BotNamesDebug =
//     | "arenafighter"
//     | "arenafighterevent"
//     | "bossboar"
//     | "bossboarsniper"
//     | "assaultgroup"
//     | "bossgluhar"
//     | "bosskilla"
//     | "assault"
//     | "bosskolontay"
//     | "bossknight"
//     | "bosspartisan"
//     | "bosskojaniy"
//     | "bosssanitar"
//     | "bosszryachiy"
//     | "bosstest"
//     | "bosstagilla"
//     | "crazyassaultevent"
//     | "followerbigpipe"
//     | "cursedassault"
//     | "followerboar"
//     | "exusec"
//     | "followerboarclose1"
//     | "followerboarclose2"
//     | "followerbully"
//     | "followerbirdeye"
//     | "followergluharassault"
//     | "followergluharscout"
//     | "bossbully"
//     | "followergluharsnipe"
//     | "bear"
//     | "followergluharsecurity"
//     | "followerkojaniy"
//     | "followersanitar"
//     | "followerkolontayassault"
//     | "followertagilla"
//     | "followerkolontaysecurity"
//     | "gifter"
//     | "followerzryachiy"
//     | "followertest"
//     | "infectedassault"
//     | "infectedcivil"
//     | "infectedlaborant"
//     | "infectedtagilla"
//     | "peacefullzryachiyevent"
//     | "infectedpmc"
//     | "peacemaker"
//     | "pmcbear"
//     | "pmcbot"
//     | "sectantoni"
//     | "sectactpriestevent"
//     | "pmcusec"
//     | "ravangezryachiyevent"
//     | "marksman"
//     | "sectantpriest"
//     | "sectantpredvestnik"
//     | "sectantwarrior"
//     | "spiritspring"
//     | "skier"
//     | "shooterbtr"
//     | "sectantprizrak"
//     | "test"
//     | "spiritwinter"
//     | "usec";
