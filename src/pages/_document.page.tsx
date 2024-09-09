import Document, { Html, Head, Main, NextScript } from 'next/document';

// commented things are for google analytics

// import { GA_TRACKING_ID } from "@/lib/gtag";

// const isProduction = process.env.NODE_ENV === "production";

export default class MyDocument extends Document {
    render(): JSX.Element {
        const lang = this?.props?.__NEXT_DATA__?.props?.pageProps?._nextI18Next?.initialLocale || 'en';
        return (
            <Html lang={lang}>
                <Head>
                <meta name="robots" content="noindex"/>
                    {/* enable analytics script only for production */}
                    {/* {isProduction && (
                        <>
                            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
                            <script
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{
                                    __html: `
                                        window.dataLayer = window.dataLayer || [];
                                        function gtag(){dataLayer.push(arguments);}
                                        gtag('js', new Date());
                                        gtag('config', '${GA_TRACKING_ID}', {
                                          page_path: window.location.pathname,
                                        });
                                      `,
                                }}
                            />
                        </>
                    )} */}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
