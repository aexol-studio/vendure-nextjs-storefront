import { useRouter } from 'next/router';
import { useEffect } from 'react';
import React from 'react';
import languageDetector from './lngDetector';
import styled from '@emotion/styled';
const AppLoader = styled.div``;

export const useRedirect = ({ to }: { to?: string }) => {
    const router = useRouter();
    to = to || router.asPath.replace('/[locale]', '');
    useEffect(() => {
        const detectedLng = languageDetector.detect();
        if (detectedLng === 'en') {
            return;
        }
        if (to?.startsWith('/' + detectedLng) && router.route !== '/404') {
            router.replace('/' + detectedLng + router.route.replace('/[locale]', ''));
            return;
        }

        if (detectedLng && languageDetector.cache) {
            languageDetector.cache(detectedLng);
        }
        router.replace('/' + detectedLng + to?.replace('/[locale]', ''));
    });
};

export const Redirect =
    ({ children }: { children?: React.ReactNode }) =>
    // eslint-disable-next-line react/display-name
    () => {
        const detectedLng = languageDetector.detect();
        if (detectedLng === 'en') {
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
