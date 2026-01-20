export const difficultyNames: DifficultyNames[] = [
    "easy",
    "normal",
    "hard",
    "impossible",
];

export const mapNames: MapNames[] = [
    "bigmap",
    "factory4_day",
    "factory4_night",
    "interchange",
    "laboratory",
    "lighthouse",
    "rezervbase",
    "sandbox",
    "sandbox_high",
    "shoreline",
    "tarkovstreets",
    "woods",
];

export const bossNames: BossNames[] = [
    "bossBully",
    "bossGluhar",
    "bossKilla",
    "bossKojaniy",
    "bossSanitar",
    "bossTagilla",
    "bossKnight",
    "bossZryachiy",
    "bossBoar",
    "bossBoarSniper",
    "bossKolontay",
    "bossPartisan",
    "followerBigPipe",
    "followerBirdEye",
    "sectantPriest",
    "sectantOni",
    "sectantPredvestnik",
    "sectantPrizrak",
];

export const botNames: BotNames[] = [
    "pmcUSEC",
    "pmcBEAR",
    "pmcBot",
    "assault",
    "crazyAssaultEvent",
    "marksman",
    "exUsec",
    "arenaFighter",
    "arenaFighterEvent",
    "sectantWarrior",
];

export const realBotName: Record<RealBotNames, string> = {
    Usec: "pmcUSEC",
    Bear: "pmcBEAR",
    Sniper: "marksman",
    Scav: "assault",
    ScavGroup: "crazyAssaultEvent",
    Rogue: "exUsec",
    Raider: "pmcBot",
    Smuggler: "arenaFighter",
    SmugglerGroup: "arenaFighterEvent",
    Kaban: "bossBoar",
    KabanSniper: "bossBoarSniper",
    KabanAssault: "followerBoar",
    KabanClose1: "followerBoarClose1",
    KabanClose2: "followerBoarClose2",
    Reshala: "bossBully",
    ReshalaAssault: "followerBully",
    Glukhar: "bossGluhar",
    GlukharAssault: "followerGluharAssault",
    GlukharScout: "followerGluharScout",
    GlukharSecurity: "followerGluharSecurity",
    GlukharSniper: "followerGluharSnipe",
    Knight: "bossKnight",
    BigPipe: "followerBigPipe",
    BirdEye: "followerBirdEye",
    Shturman: "bossKojaniy",
    ShturmanAssault: "followerKojaniy",
    ShturmanAssault2: "followerKolontayAssault",
    ShturmanSecurity: "followerKolontaySecurity",
    Kolontay: "bossKolontay",
    Partisan: "bossPartisan",
    Sanitar: "bossSanitar",
    SanitarAssault: "followerSanitar",
    Killa: "bossKilla",
    Tagilla: "bossTagilla",
    TagillaAssault: "followerTagilla",
    Zryachiy: "bossZryachiy",
    ZryachiyAssault: "followerZryachiy",
    CultistPriest: "sectantPriest",
    Cultist: "sectantWarrior",
    CultistOni: "sectantOni",
    CultistPredvestni: "sectantPredvestnik",
    CultistPrizrak: "sectantPrizrak",
};

export const realMapNames: Record<RealMapNames, string> = {
    Customs: "bigmap",
    Factory: "factory4_day",
    FactoryNight: "factory4_night",
    Interchange: "interchange",
    Laboratory: "laboratory",
    Lighthouse: "lighthouse",
    Reserve: "rezervbase",
    GroundZero: "sandbox",
    GroundZeroHigh: "sandbox_high",
    Shoreline: "shoreline",
    Streets: "tarkovstreets",
    Woods: "woods",
};

export type RealBotNames =
    | "Usec"
    | "Bear"
    | "Sniper"
    | "Scav"
    | "ScavGroup"
    | "Rogue"
    | "Raider"
    | "Smuggler"
    | "SmugglerGroup"
    | "Kaban"
    | "KabanSniper"
    | "KabanAssault"
    | "KabanClose1"
    | "KabanClose2"
    | "Reshala"
    | "ReshalaAssault"
    | "Glukhar"
    | "GlukharAssault"
    | "GlukharScout"
    | "GlukharSecurity"
    | "GlukharSniper"
    | "Knight"
    | "BigPipe"
    | "BirdEye"
    | "Shturman"
    | "ShturmanAssault"
    | "ShturmanAssault2"
    | "ShturmanSecurity"
    | "Kolontay"
    | "Partisan"
    | "Sanitar"
    | "SanitarAssault"
    | "Killa"
    | "Tagilla"
    | "TagillaAssault"
    | "Zryachiy"
    | "ZryachiyAssault"
    | "CultistPriest"
    | "Cultist"
    | "CultistOni"
    | "CultistPredvestni"
    | "CultistPrizrak";

export type RealMapNames =
    | "Customs"
    | "Factory"
    | "FactoryNight"
    | "Interchange"
    | "Laboratory"
    | "Lighthouse"
    | "Reserve"
    | "GroundZero"
    | "GroundZeroHigh"
    | "Shoreline"
    | "Streets"
    | "Woods";

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
    | "infectedLaborant"
    | "infectedtagilla";

export type BossNames =
    | "bossBully"
    | "bossGluhar"
    | "bossKilla"
    | "bossKojaniy"
    | "bossSanitar"
    | "bossTagilla"
    | "bossKnight"
    | "bossZryachiy"
    | "bossBoar"
    | "bossBoarSniper"
    | "bossKolontay"
    | "bossPartisan"
    | "followerBigPipe"
    | "followerBirdEye"
    | "sectantPriest"
    | "sectantOni"
    | "sectantPredvestnik"
    | "sectantPrizrak";

export type BossFollowerNames =
    | "bossBoarSniper"
    | "followerBigPipe"
    | "followerBirdEye"
    | "followerBoar"
    | "followerBoarClose1"
    | "followerBoarClose2"
    | "followerBully"
    | "followerGluharAssault"
    | "followerGluharScout"
    | "followerGluharSecurity"
    | "followerGluharSnipe"
    | "followerKojaniy"
    | "followerKolontayAssault"
    | "followerKolontaySecurity"
    | "followerSanitar"
    | "followerTagilla"
    | "followerZryachiy"
    | "sectantWarrior"
    | "sectantPredvestnik"
    | "sectantPrizrak";

export type BotNames =
    | "pmcUSEC"
    | "pmcBEAR"
    | "assault"
    | "crazyAssaultEvent"
    | "marksman"
    | "exUsec"
    | "arenaFighter"
    | "arenaFighterEvent"
    | "pmcBot"
    | "sectantWarrior";

export type BotNamesAll =
    | "arenaFighter"
    | "arenaFighterEvent"
    | "assault"
    | "bossBoar"
    | "bossBoarSniper"
    | "bossBully"
    | "bossGluhar"
    | "bossKilla"
    | "bossKnight"
    | "bossKojaniy"
    | "bossKolontay"
    | "bossPartisan"
    | "bossSanitar"
    | "bossTagilla"
    | "bossZryachiy"
    | "crazyAssaultEvent"
    | "exUsec"
    | "followerBigPipe"
    | "followerBirdEye"
    | "followerBoar"
    | "followerBoarClose1"
    | "followerBoarClose2"
    | "followerBully"
    | "followerGluharAssault"
    | "followerGluharScout"
    | "followerGluharSecurity"
    | "followerGluharSnipe"
    | "followerKojaniy"
    | "followerKolontayAssault"
    | "followerKolontaySecurity"
    | "followerSanitar"
    | "followerTagilla"
    | "followerZryachiy"
    | "marksman"
    | "pmcBEAR"
    | "pmcBot"
    | "pmcUSEC"
    | "sectantOni"
    | "sectantPredvestnik"
    | "sectantPriest"
    | "sectantPrizrak"
    | "sectantWarrior";

export type BotNamesDebug =
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

export interface ModConfig {
    enable: boolean;
}
