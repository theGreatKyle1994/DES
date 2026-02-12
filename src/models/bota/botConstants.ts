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

export const botZoneDefaults: BotZones = {
    bigmap: { general: [] },
    factory4_day: { general: [] },
    factory4_night: { general: [] },
    interchange: { general: [] },
    laboratory: { general: [] },
    lighthouse: { general: [] },
    rezervbase: { general: [] },
    sandbox: { general: [] },
    sandbox_high: { general: [] },
    shoreline: { general: [] },
    tarkovstreets: { general: [] },
    woods: { general: [] },
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
