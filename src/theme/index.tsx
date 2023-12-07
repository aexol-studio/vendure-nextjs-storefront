type Level = 0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;
export type MainTheme = {
    accent: (l: Level) => string;
    gray: (l: Level) => string;
    grayAlpha: (l: Level, alpha: number) => string;
    borderRadius: string;
};

export const createTheme = (hue: number): MainTheme => ({
    accent: (l: Level) => `lch(${100.0 - l / 10.0}% ${l / 10.0} ${hue});`,
    gray: (g: Level) => `lch(${100.0 - g / 10.0}% 0 0);`,
    grayAlpha: (g: Level, alpha: number) => `lch(${100.0 - g / 10.0}% 0 0 / ${alpha});`,
    borderRadius: '0rem',
});

export const LightTheme = createTheme(300);
