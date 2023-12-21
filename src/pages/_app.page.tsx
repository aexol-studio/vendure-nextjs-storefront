import React from 'react';
import '../styles/global.css';
import 'react-toastify/dist/ReactToastify.css';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { Noto_Sans_HK } from 'next/font/google';
import { Global, ThemeProvider } from '@emotion/react';
import { LightTheme } from '@/src/theme';
import { CartProvider } from '@/src/state/cart';
import { ToastContainer } from 'react-toastify';
import { useRouter } from 'next/router';
const sans = Noto_Sans_HK({ subsets: ['latin'] });

//Those routes use SSR, so we don't want to use cart state
const checkoutPaths = ['/checkout', '/checkout/payment'];

const App = ({ Component, pageProps }: AppProps) => {
    const router = useRouter();
    const isCheckout = checkoutPaths.some(path => router.pathname === path);
    const Wrapper = isCheckout ? React.Fragment : CartProvider;

    return (
        <ThemeProvider theme={LightTheme}>
            <Global styles={`body { font-family:${sans.style.fontFamily}; }`} />
            <Wrapper>
                <Component {...pageProps} />
            </Wrapper>
            <ToastContainer />
        </ThemeProvider>
    );
};

export default appWithTranslation(App);
