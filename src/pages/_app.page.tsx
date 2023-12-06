import '../styles/global.css';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { Nunito } from 'next/font/google';
import { Global, ThemeProvider } from '@emotion/react';
import { LightTheme } from '@/src/theme';
import { CartProvider } from '@/src/state/cart';
const sans = Nunito({ subsets: ['latin'] });
const App = ({ Component, pageProps }: AppProps) => {
    return (
        <ThemeProvider theme={LightTheme}>
            <Global
                styles={`
            body{
                font-family:${sans.style.fontFamily};
                color:black;
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
