type Level = 0 | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;
type FunctionTheme = {
    accent: (l: Level) => string;
    gray: (l: Level) => string;
    grayAlpha: (l: Level, alpha: number) => string;
    borderRadius: string;
};

type DetailTheme = {
    text: {
        main: string;
        inactive: string;
    };
    background: {
        main: string;
        secondary: string;
        third: string;
    };
    button: {
        back: string;
        front: string;
        hover?: {
            back?: string;
            front?: string;
        };
        icon: {
            front: string;
            back?: string;
        };
    };
    error: string;
    success: string;
};

export type MainTheme = FunctionTheme & DetailTheme;

const defaultThemeFunction = (hue: number) => ({
    accent: (l: Level) => `lch(${100.0 - l / 10.0}% ${l / 10.0} ${hue});`,
    gray: (g: Level) => `lch(${100.0 - g / 10.0}% 0 0);`,
    grayAlpha: (g: Level, alpha: number) => `lch(${100.0 - g / 10.0}% 0 0 / ${alpha});`,
    borderRadius: '0rem',
});

type Emotional = {
    theme: MainTheme;
};

type Gen<T> = {
    [P in keyof T]: T[P] extends string ? (emotionHtmlTheme: Emotional) => string : Gen<T[P]>;
};

const themeTransform = (t: MainTheme) => {
    const tree = (o: Record<string, string> | Record<string, unknown>, prefix: string[] = []) => {
        Object.entries(o).forEach(([k, v]) => {
            if (typeof v === 'string') {
                o[k] = (fn: Emotional) => {
                    const startingPoint = fn.theme as Record<string, unknown>;
                    const finalValue = [...prefix, k].reduce<Record<string, unknown> | string | undefined>((a, b) => {
                        if (a && typeof a === 'object') {
                            const value = a[b];
                            if (typeof value === 'string') {
                                return value;
                            }
                            if (value && typeof value === 'object') {
                                return value as Record<string, unknown>;
                            }
                        }
                    }, startingPoint);
                    return finalValue as string;
                };
            }
            if (v && typeof v === 'object') {
                tree(v as Record<string, unknown>, [...prefix, k]);
            }
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { gray, accent, borderRadius, grayAlpha, ...rest } = t;
    const deepRestCopy = JSON.parse(JSON.stringify(rest));
    tree(deepRestCopy);
    return deepRestCopy as Gen<DetailTheme>;
};

export const createTheme = (
    hue: number,
    fn: (theme: FunctionTheme) => DetailTheme,
    themeFunction = defaultThemeFunction,
): MainTheme => {
    const r = themeFunction(hue);
    return {
        ...r,
        ...fn(r),
    };
};

export const LightTheme = createTheme(300, t => ({
    background: {
        main: t.gray(0),
        secondary: t.gray(25),
        third: t.gray(50),
    },
    text: {
        main: t.gray(900),
        inactive: t.gray(200),
    },
    button: {
        back: t.gray(900),
        front: t.gray(0),
        icon: { front: t.gray(900) },
    },
    error: '#ff0000',
    success: '#00ff00',
}));
export const thv = themeTransform(LightTheme);
