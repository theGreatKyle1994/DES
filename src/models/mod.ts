// SPT
import type { DatabaseService } from "@spt/services/DatabaseService";
import type { ConfigServer } from "@spt/servers/ConfigServer";

export type MapNames =
    | "bigmap"
    | "factory4_day"
    | "factory4_night"
    | "interchange"
    | "laboratory"
    | "lighthouse"
    | "rezervbase"
    | "sandbox"
    | "sandbox_high"
    | "shoreline"
    | "tarkovstreets"
    | "woods";

export type ZombieNames =
    | "infectedAssault"
    | "infectedPmc"
    | "infectedCivil"
    | "infectedLaborant";

export type BossNames =
    | "bossboar"
    | "bossgluhar"
    | "bosskilla"
    | "bosskolontay"
    | "bossknight"
    | "bosspartisan"
    | "bosskojaniy"
    | "bosssanitar"
    | "bosszryachiy"
    | "bosstagilla";

export type BotNames =
    | "arenafighter"
    | "arenafighterevent"
    | "bossboar"
    | "bossboarsniper"
    | "assaultgroup"
    | "bossgluhar"
    | "bosskilla"
    | "assault"
    | "bosskolontay"
    | "bossknight"
    | "bosspartisan"
    | "bosskojaniy"
    | "bosssanitar"
    | "bosszryachiy"
    | "bosstest"
    | "bosstagilla"
    | "crazyassaultevent"
    | "followerbigpipe"
    | "cursedassault"
    | "followerboar"
    | "exusec"
    | "followerboarclose1"
    | "followerboarclose2"
    | "followerbully"
    | "followerbirdeye"
    | "followergluharassault"
    | "followergluharscout"
    | "bossbully"
    | "followergluharsnipe"
    | "bear"
    | "followergluharsecurity"
    | "followerkojaniy"
    | "followersanitar"
    | "followerkolontayassault"
    | "followertagilla"
    | "followerkolontaysecurity"
    | "gifter"
    | "followerzryachiy"
    | "followertest"
    | "infectedassault"
    | "infectedcivil"
    | "infectedlaborant"
    | "infectedtagilla"
    | "peacefullzryachiyevent"
    | "infectedpmc"
    | "peacemaker"
    | "pmcbear"
    | "pmcbot"
    | "sectantoni"
    | "sectactpriestevent"
    | "pmcusec"
    | "ravangezryachiyevent"
    | "marksman"
    | "sectantpriest"
    | "sectantpredvestnik"
    | "sectantwarrior"
    | "spiritspring"
    | "skier"
    | "shooterbtr"
    | "sectantprizrak"
    | "test"
    | "spiritwinter"
    | "usec";

export type DifficultyNames = "easy" | "normal" | "hard" | "impossible";

export interface GameConfigs {
    database?: DatabaseService;
    configs?: ConfigServer;
}

export interface ModConfig {
    enable: boolean;
}
