import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import React from 'react';
import languageDetector from './lngDetector';
import styled from '@emotion/styled';
import { Url } from 'next/dist/shared/lib/router/router';
import { DEFAULT_LOCALE } from './consts';

const AppLoader = styled.div``;

export const useRedirect = ({ to }: { to?: string }) => {
    const router = useRouter();
    to = to || router.asPath.replace('/[channel]', '');
    useEffect(() => {
        const detectedLng = languageDetector.detect();
        // if (detectedLng === DEFAULT_LOCALE) {
        //     return;
        // }
        if (to?.startsWith('/' + detectedLng) && router.route !== '/404') {
            router.replace('/' + detectedLng + router.route.replace('/[channel]', ''));
            return;
        }

        if (detectedLng && languageDetector.cache) {
            languageDetector.cache(detectedLng);
        }
        router.replace('/' + detectedLng + to?.replace('/[channel]', ''));
    });
};

export const Redirect =
    (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { children }: { children?: React.ReactNode },
    ) =>
    // eslint-disable-next-line react/display-name
    () => {
        // const detectedLng = languageDetector.detect();
        // if (detectedLng === DEFAULT_LOCALE) {
        //     return children;
        // }
        useRedirect({});
        return <AppLoader />;
    };

// eslint-disable-next-line react/display-name
export const getRedirect = (to?: string) => () => {
    useRedirect({ to });
    return <AppLoader />;
};

interface TransitionOptions {
    shallow?: boolean;
    scroll?: boolean;
    unstable_skipClientCache?: boolean;
}

export const usePush = () => {
    const router = useRouter();
    const lang = languageDetector.detect();
    const locale = lang === DEFAULT_LOCALE ? '' : '/' + lang;

    return useCallback(
        (to?: string, as?: Url, options?: TransitionOptions) => {
            router.push(`${locale}${to}`, as, options);
        },
        [lang, router.query.locale],
    );
};
