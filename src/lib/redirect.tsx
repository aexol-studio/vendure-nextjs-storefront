import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import React from 'react';
import languageDetector from './lngDetector';
import styled from '@emotion/styled';
import { Url } from 'next/dist/shared/lib/router/router';
import { DEFAULT_LOCALE, channels } from './consts';

const AppLoader = styled.div``;

export const useRedirect = ({ to }: { to?: string }) => {
    const router = useRouter();
    to = to || router.asPath.replace('/[channel]', '');
    useEffect(() => {
        // TODO: Cache channel in cookie
        const detectedChannel = document.cookie
            .split(';')
            .find(c => c.trim().startsWith('channel='))
            ?.split('=')[1];
        console.log(detectedChannel);

        const detectedLng = languageDetector.detect();
        const ch = channels.find(c => c.slug === detectedLng);
        // if (detectedLng === DEFAULT_LOCALE) {
        //     return;
        // }

        const channel = ch?.slug || channels.find(c => c.locales.includes(detectedLng || ''))?.slug || DEFAULT_LOCALE;
        const locale = ch?.slug === ch?.nationalLocale ? '' : `/${ch?.nationalLocale}`;

        if (to?.startsWith('/' + channel) && router.route !== '/404') {
            router.replace('/' + channel + router.route.replace('/[channel]', '').replace('/[locale]', locale));
            return;
        }

        if (detectedLng && languageDetector.cache) {
            languageDetector.cache(detectedLng);
        }
        router.replace('/' + channel + to?.replace('/[channel]', '').replace('/[locale]', locale));
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
    const channel = router.query.channel;
    const locale = router.query.locale ? `/${router.query.locale}` : '';

    return useCallback(
        (to?: string, as?: Url, options?: TransitionOptions) => {
            router.push(`/${channel}${locale}${to}`, as, options);
        },
        [router.query],
    );
};
