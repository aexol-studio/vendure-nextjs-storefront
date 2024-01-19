import { useRouter } from 'next/router';

import { useCallback } from 'react';
import React from 'react';
import styled from '@emotion/styled';
import { Url } from 'next/dist/shared/lib/router/router';
import { GetServerSidePropsContext } from 'next';

const AppLoader = styled.div``;

//NOTE: middleware do this (keep it in emergency)
export const useRedirect = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { to }: { to?: string },
) => {
    // const router = useRouter();
    // to = to || router.asPath.replace('/[channel]', '');
    // console.log(to);
    // useEffect(() => {
    //     const cachedChannel = document.cookie
    //         .split(';')
    //         .find(c => c.trim().startsWith('channel='))
    //         ?.split('=')[1];
    //     const detectedLng = languageDetector.detect();
    //     const ch = cachedChannel
    //         ? channels.find(c => c.channel === cachedChannel)
    //         : channels.find(c => c.slug === detectedLng);
    //     const channelSlug = ch?.slug ?? DEFAULT_CHANNEL_SLUG;
    //     if (channelSlug === DEFAULT_CHANNEL_SLUG) {
    //         return;
    //     }
    //     const locale = ch?.slug === ch?.nationalLocale ? '' : `/${ch?.nationalLocale}`;
    //     if (to?.startsWith('/' + channelSlug) && router.route !== '/404') {
    //         router.replace('/' + channelSlug + router.route.replace('/[channel]', '').replace('/[locale]', locale));
    //         return;
    //     }
    //     if (detectedLng && languageDetector.cache) {
    //         languageDetector.cache(detectedLng);
    //     }
    //     router.replace('/' + channelSlug + to?.replace('/[channel]', '').replace('/[locale]', locale));
    // });
};

//NOTE: middleware do this (keep it in emergency)
export const Redirect =
    ({ children }: { children?: React.ReactNode }) =>
    // eslint-disable-next-line react/display-name
    () => {
        return children;

        // prev version
        // const [cookie, setCookie] = useState<string>();
        // useEffect(() => {
        //     const cachedChannel = document.cookie
        //         .split(';')
        //         .find(c => c.trim().startsWith('channel='))
        //         ?.split('=')[1];
        //     setCookie(cachedChannel);
        // }, []);
        // const ch = channels.find(c => c.channel === cookie);
        // const channelSlug = ch?.slug ?? DEFAULT_CHANNEL_SLUG;
        // // const detectedLng = languageDetector.detect();
        // if (channelSlug === DEFAULT_CHANNEL_SLUG) {
        //     return children;
        // }
        // useRedirect({});
        // return <AppLoader />;
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

    return useCallback(
        (to?: string, as?: Url, options?: TransitionOptions) => {
            //VERIFY: router.query.channel === DEFAULT_CHANNEL_SLUG this case should not exist because of middleware

            const channel = router.query.channel ? `/${router.query.channel}` : '';
            const locale = router.query.locale ? `/${router.query.locale}` : '';
            router.push(`${channel}${locale}${to}`, as, options);
        },
        [router.query],
    );
};

export const prepareSSRRedirect = (where: string) => (ctx: GetServerSidePropsContext) => {
    const channel = ctx.params?.channel ? `/${ctx.params.channel}` : '';
    const locale = ctx.params?.locale ? `/${ctx.params.locale}` : '';

    const destination = `${channel}${locale}${where}`;
    return { redirect: { destination, permanent: false } };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const redirectFromDefaultChannelSSR = (ctx: GetServerSidePropsContext) => {
    //NOTE: middleware do this (keep it in emergency)
    return null;
};
