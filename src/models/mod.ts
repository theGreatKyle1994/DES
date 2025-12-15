export interface ModConfig {
    enable: boolean;
    debug: boolean;
    modules: {
        seasons: {
            enable: boolean;
            useLength: boolean;
            useRandom: boolean;
        };
        weather: {
            enable: boolean;
            useLength: boolean;
            useCustom: boolean;
        };
    };
}
