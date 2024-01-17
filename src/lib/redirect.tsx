import { useRouter } from 'next/router';

import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import languageDetector from './lngDetector';
import styled from '@emotion/styled';
import { Url } from 'next/dist/shared/lib/router/router';
import { DEFAULT_CHANNEL, DEFAULT_CHANNEL_SLUG, channels } from './consts';
import { GetServerSidePropsContext } from 'next';

const AppLoader = styled.div``;

export const useRedirect = ({ to }: { to?: string }) => {
    const router = useRouter();
    to = to || router.asPath.replace('/[channel]', '');
    useEffect(() => {
        const cachedChannel = document.cookie
            .split(';')
            .find(c => c.trim().startsWith('channel='))
            ?.split('=')[1];

        const detectedLng = languageDetector.detect();
        const ch = cachedChannel
            ? channels.find(c => c.channel === cachedChannel)
            : channels.find(c => c.slug === detectedLng);

        const channelSlug = ch?.slug ?? DEFAULT_CHANNEL_SLUG;
        if (channelSlug === DEFAULT_CHANNEL_SLUG) {
            return;
        }
        const locale = ch?.slug === ch?.nationalLocale ? '' : `/${ch?.nationalLocale}`;
        if (to?.startsWith('/' + channelSlug) && router.route !== '/404') {
            router.replace('/' + channelSlug + router.route.replace('/[channel]', '').replace('/[locale]', locale));
            return;
        }
        if (detectedLng && languageDetector.cache) {
            languageDetector.cache(detectedLng);
        }
        router.replace('/' + channelSlug + to?.replace('/[channel]', '').replace('/[locale]', locale));
    });
};

export const Redirect =
    ({ children }: { children?: React.ReactNode }) =>
    // eslint-disable-next-line react/display-name
    () => {
        const [cookie, setCookie] = useState<string>();
        useEffect(() => {
            const cachedChannel = document.cookie
                .split(';')
                .find(c => c.trim().startsWith('channel='))
                ?.split('=')[1];
            setCookie(cachedChannel);
        }, []);
        const ch = channels.find(c => c.channel === cookie);
        const channelSlug = ch?.slug ?? DEFAULT_CHANNEL_SLUG;

        // const detectedLng = languageDetector.detect();
        if (channelSlug === DEFAULT_CHANNEL_SLUG) {
            return children;
        }
        useRedirect({});
        return <AppLoader />;
    };

// eslint-disable-next-line react/display-name
export const getRedirect = (to?: string) => () => {
    useRedirect({ to });
    return <AppLoader />;
};

export const redirectFromDefaultChannel = ({ children }: { children?: React.ReactNode }) => {
    const router = useRouter();
    useEffect(() => {
        if (router.query.channel === DEFAULT_CHANNEL_SLUG) {
            router.replace(router.asPath.replace(`/${DEFAULT_CHANNEL_SLUG}`, ''));
            if (typeof window !== 'undefined') {
                window.document.cookie = `channel=${DEFAULT_CHANNEL};`;
            }
        }
    }, []);
    return children;
};

interface TransitionOptions {
    shallow?: boolean;
    scroll?: boolean;
    unstable_skipClientCache?: boolean;
}

export const usePush = () => {
    const router = useRouter();

    return useCallback(
        (to?: string, as?: Url, options?: TransitionOptions) => {
            const channel = router.query.channel
                ? router.query.channel === DEFAULT_CHANNEL_SLUG && !router.query.locale
                    ? ``
                    : `/${router.query.channel}`
                : '';
            const locale = router.query.locale ? `/${router.query.locale}` : '';
            router.push(`${channel}${locale}${to}`, as, options);
        },
        [router.query],
    );
};

export const prepareSSRRedirect = (where: string) => (ctx: GetServerSidePropsContext) => {
    const channel = ctx.params?.channel;
    const locale = ctx.params?.locale ? `/${ctx.params.locale}` : '';

    const destination = `/${channel}${locale}${where}`;
    return { redirect: { destination, permanent: false } };
};

export const redirectFromDefaultChannelSSR = (ctx: GetServerSidePropsContext) => {
    if (ctx.params?.channel === DEFAULT_CHANNEL_SLUG && !ctx.params?.locale) {
        // const destination = ctx.resolvedUrl.replace(`/${DEFAULT_CHANNEL_SLUG}`, '');
        //TODO: hold it for now
        return null;
    }
    return null;
};
