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

export const modConfigDefaults: ModConfig = {
    enable: true,
    debug: false,
    modules: {
        seasons: {
            enable: true,
            useLength: true,
            useRandom: false,
        },
        weather: {
            enable: true,
            useLength: true,
            useCustom: false,
        },
    },
};
