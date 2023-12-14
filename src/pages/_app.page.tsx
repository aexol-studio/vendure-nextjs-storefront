import '../styles/global.css';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { Noto_Sans_HK } from 'next/font/google';
import { Global, ThemeProvider } from '@emotion/react';
import { LightTheme } from '@/src/theme';
import { CartProvider } from '@/src/state/cart';
const sans = Noto_Sans_HK({ subsets: ['latin'] });
const App = ({ Component, pageProps }: AppProps) => {
    return (
        <ThemeProvider theme={LightTheme}>
            <Global
                styles={`
            body{
                font-family:${sans.style.fontFamily};
            }
            `}
            />
            <CartProvider>
                <Component {...pageProps} />
            </CartProvider>
        </ThemeProvider>
    );
};

export default appWithTranslation(App);
