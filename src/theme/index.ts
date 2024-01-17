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

export type MainTheme = FunctionTheme & DetailTheme & { colorsPalette: Record<string, string> };

export const defaultThemeFunction = (hue: number) => ({
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

export const themeTransform = (t: MainTheme) => {
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

//TU MAMY PALETY : ZWYKŁA + DLA DANEJ KOLEKCJI
const defaultPalette = {
    red: '#23232',
    blue: '#44555',
};

const childrenPalette = {
    red: '#00000',
    blue: '#99999',
};
export const createTheme = (
    hue: number,
    fn: (theme: FunctionTheme) => DetailTheme,
    themeFunction = defaultThemeFunction,
    slug: string,
): MainTheme => {
    const r = themeFunction(hue);
    //sprawdzać czy slug(który jest tablicą w app.page.tsx) zawiera daną kolekcję np /electronics
    const colorsPalette = slug && slug.includes('electronics') ? childrenPalette : defaultPalette;

    return {
        ...r,
        //zwrócić odpowiednią paletę
        colorsPalette,
        ...fn(r),
    };
};
