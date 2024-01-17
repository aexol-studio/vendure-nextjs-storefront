import React from 'react';
import '../styles/global.css';
import 'keen-slider/keen-slider.min.css';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { Nunito_Sans } from 'next/font/google';
import { Global, ThemeProvider } from '@emotion/react';
// import { createTheme, defaultThemeFunction, themeTransform } from '@/src/theme';
import { CartProvider } from '@/src/state/cart';
import { CheckoutProvider } from '@/src/state/checkout';
import { ProductProvider } from '@/src/state/product';
import { CollectionProvider } from '@/src/state/collection';
import { ChannelsProvider } from '../state/channels';
import { createTheme, defaultThemeFunction } from '../theme';

const nunito = Nunito_Sans({ subsets: ['latin'], variable: '--nunito-font' });

const App = ({ Component, pageProps }: AppProps) => {
    const LightTheme = createTheme(
        300,
        t => ({
            background: {
                main: t.gray(0),
                secondary: t.gray(25),
                third: t.gray(50),
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
            shadow: t.grayAlpha(200, 100),
            error: '#eb1b19',
            success: '#1beb1b',
            price: {
                default: t.gray(1000),
                discount: '#FF8080',
            },
            breakpoints: {
                ssm: '576px',
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px',
            },
        }),
        defaultThemeFunction,
        pageProps.slug,
    );
    return (
        <ThemeProvider theme={LightTheme}>
            <ChannelsProvider initialState={{ channel: pageProps.channel, locale: pageProps.locale }}>
                <Global styles={`body { font-family:${nunito.style.fontFamily}; }`} />
                {/* `checkout` prop should exist only on routes with checkout functionally */}
                {'checkout' in pageProps ? (
                    <CheckoutProvider initialState={{ checkout: pageProps.checkout }}>
                        <Component {...pageProps} />
                    </CheckoutProvider>
                ) : (
                    <CartProvider>
                        <ProductProvider
                            initialState={{
                                product: 'product' in pageProps ? pageProps.product : undefined,
                            }}>
                            <CollectionProvider
                                initialState={{
                                    collection: 'collection' in pageProps ? pageProps.collection : undefined,
                                    products: 'products' in pageProps ? pageProps.products : undefined,
                                    facets: 'facets' in pageProps ? pageProps.facets : undefined,
                                    totalProducts: 'totalProducts' in pageProps ? pageProps.totalProducts : undefined,
                                    filters: 'filters' in pageProps ? pageProps.filters : undefined,
                                    searchQuery: 'searchQuery' in pageProps ? pageProps.searchQuery : undefined,
                                    page: 'page' in pageProps ? pageProps.page : undefined,
                                    sort: 'sort' in pageProps ? pageProps.sort : undefined,
                                }}>
                                <Component {...pageProps} />
                            </CollectionProvider>
                        </ProductProvider>
                    </CartProvider>
                )}
            </ChannelsProvider>
        </ThemeProvider>
    );
};

export default appWithTranslation(App);
// export const thv = themeTransform(LightTheme);
