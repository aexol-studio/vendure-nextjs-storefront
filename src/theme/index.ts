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
        subtitle: string;
        contrast: string;
    };
    background: {
        main: string;
        secondary: string;
        third: string;
        ice: string;
        white: string;
        modal: string;
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
    shadow: string;
    error: string;
    success: string;
    tile: {
        background: string;
        hover: string;
    };
    placeholder: string;
    noteCard: string;
    outline: string;
    breakpoints: {
        /** 576px */
        ssm: string;
        /** 640px */
        sm: string;
        /** 768px */
        md: string;
        /** 1024px */
        lg: string;
        /** 1280px */
        xl: string;
        /** 1536px */
        '2xl': string;
    };
    price: {
        default: string;
        discount: string;
    };
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
        ice: '#f8f8f8',
        white: '#ffffff',
        modal: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
        main: `lch(9.72% 6.43 251.05)`,
        inactive: t.gray(200),
        subtitle: `lch(47.82% 6.77 249.38)`,
        contrast: t.gray(0),
    },
    button: {
        back: '#141C23',
        front: t.gray(0),
        icon: { front: t.gray(900) },
    },
    shadow: `#69737c30`,
    error: '#eb1b19',
    success: '#1beb1b',
    price: {
        default: t.gray(1000),
        discount: '#FF8080',
    },
    tile: {
        background: '#69737c',
        hover: '#5b636b',
    },
    placeholder: '#9398a1',
    noteCard: '#ffff99',
    outline: '#dcdcdc',
    breakpoints: {
        ssm: '576px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
}));
export const thv = themeTransform(LightTheme);
