import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_CHANNEL, DEFAULT_LOCALE, channels } from './lib/consts';

const LOCALES = ['en', 'pl'];
const getBrowserLanguage = (req: NextRequest) => {
    return req.headers
        .get('accept-language')
        ?.split(',')
        .map(i => i.split(';'))
        ?.reduce((ac: { code: string; priority: string }[], lang) => [...ac, { code: lang[0], priority: lang[1] }], [])
        ?.sort((a, b) => (a.priority > b.priority ? -1 : 1))
        ?.find(i => LOCALES.includes(i.code.substring(0, 2)))
        ?.code?.substring(0, 2);
};

export function middleware(request: NextRequest) {
    console.log(request);
    const cachedLocale = request.cookies.get('i18next')?.value;
    const cachedChannel = request.cookies.get('channel')?.value;
    console.log(cachedLocale, cachedChannel);
    const requestLanguage = getBrowserLanguage(request);
    console.log(requestLanguage);

    const defaultLocale = cachedLocale || DEFAULT_LOCALE;
    // const defaultChannel = cachedChannel || DEFAULT_CHANNEL;

    if (cachedChannel && cachedLocale) {
        if (cachedChannel !== DEFAULT_CHANNEL || cachedLocale !== DEFAULT_LOCALE) {
            console.log(cachedChannel, cachedLocale);
        }
    }
    const url = new URL(request.nextUrl);
    console.log(request.nextUrl);
    url.searchParams.delete('channel');
    url.searchParams.delete('locale');
    console.log(url);

    const allLocales = channels.map(ch => ch.locales).flat();
    const cookies = request.cookies;
    const channel = cookies.get('channel')?.value || 'default-channel';
    const channelSlug = channels.find(ch => ch.channel === channel)?.slug || '';
    const split = url.pathname.split('/').filter(x => x !== '');
    console.log(split);

    const preparedRouteOnCachedElements = `${channels.find(ch => ch.channel === channel)?.slug || ''}/${
        cachedLocale || defaultLocale
    }`;
    console.log(preparedRouteOnCachedElements);

    if (split.includes(channelSlug)) {
        const locale = split[split.indexOf(channelSlug) + 1];
        console.log(locale);
        const isLocaleValid = locale ? allLocales.includes(locale) : false;
        console.log(isLocaleValid);
        console.log(channelSlug);

        if (!isLocaleValid && channelSlug === 'en') {
            // set cookie
            console.log('here', url);
            console.log(url);
            const replaced = url.href.replace(`/${channelSlug}`, ``);
            console.log(replaced);
            //check if replaced route make sense for chached elements

            return NextResponse.redirect(new URL(replaced), { status: 308 });
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: `/((?!api|_next/static|_next/image|favicon.ico).*)`,
    // matcher: [
    //     /*
    //      * Match all request paths except for the ones starting with:
    //      * - api (API routes)
    //      * - _next/static (static files)
    //      * - _next/image (image optimization files)
    //      * - favicon.ico (favicon file)
    //      */
    //     '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // ],
};
