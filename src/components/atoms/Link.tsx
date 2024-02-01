import React, { PropsWithChildren } from 'react';
import NextLink, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { DEFAULT_CHANNEL_SLUG } from '@/src/lib/consts';

const notTranslatedLinks: string[] = [];

interface LinkComponentProps extends LinkProps {
    skipLocaleHandling?: boolean;
    external?: boolean;
    style?: React.CSSProperties;
    ariaLabel?: string;
}

export const Link: React.FC<PropsWithChildren<LinkComponentProps>> = ({
    children,
    skipLocaleHandling,
    external,
    ariaLabel,
    ...rest
}) => {
    const router = useRouter();
    const locale = (rest.locale || router.query.locale || '') as string;
    const channel = (router.query.channel || '') as string;
    const { href, ...restProps } = rest;
    let linkHref = (href || router.asPath) as string;
    if (linkHref.indexOf('http') === 0) skipLocaleHandling = true;
    if (notTranslatedLinks.find(ntl => linkHref.startsWith(ntl))) skipLocaleHandling = true;
    // if (locale && !skipLocaleHandling && locale !== 'en') {
    //     linkHref = href ? `/${locale}${linkHref}` : router.pathname.replace('[locale]', locale);
    // }
    const _channel = channel
        ? channel === DEFAULT_CHANNEL_SLUG && !router.query.locale
            ? ``
            : `/${router.query.channel}`
        : '';
    if (_channel && !skipLocaleHandling) {
        linkHref = href
            ? `${_channel}${locale ? `/${locale}` : ''}${linkHref}`
            : router.pathname.replace('/[channel]', _channel).replace('/[locale]', `/${locale}` ?? '');
    }

    return (
        <NextLink aria-label={ariaLabel} href={linkHref} {...(external && { target: '_blank' })} {...restProps}>
            {children}
        </NextLink>
    );
};
