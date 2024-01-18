import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_CHANNEL_SLUG, DEFAULT_LOCALE } from './lib/consts';

// const LOCALES = ['en', 'pl'];
// const getBrowserLanguage = (req: NextRequest) => {
//     return req.headers
//         .get('accept-language')
//         ?.split(',')
//         .map(i => i.split(';'))
//         ?.reduce((ac: { code: string; priority: string }[], lang) => [...ac, { code: lang[0], priority: lang[1] }], [])
//         ?.sort((a, b) => (a.priority > b.priority ? -1 : 1))
//         ?.find(i => LOCALES.includes(i.code.substring(0, 2)))
//         ?.code?.substring(0, 2);
// };

export function middleware(request: NextRequest) {
    const url = new URL(request.url);
    const cachedLocale = request.cookies.get('i18next')?.value;
    const cachedChannel = request.cookies.get('channel')?.value;

    const regex = new RegExp(`/[a-z]{2}(/[a-z]{2})?/`);
    if (regex.test(url.pathname)) {
        const split = url.pathname.split('/').filter(x => x !== '');
        const channel = split[0];
        const locale = split[1];
        const replaced = url.href.replace(`/${channel}`, ``);
        const response = NextResponse.redirect(new URL(replaced), { status: 308 });

        if (channel === DEFAULT_CHANNEL_SLUG) {
            if (!locale || (locale && locale?.length !== 2)) {
                response.cookies.set('channel', channel, { path: '/' });
                response.cookies.set('i18next', DEFAULT_LOCALE, { path: '/' });
                return response;
            }
        }
    }

    const response = NextResponse.next();
    const channel = cachedChannel || DEFAULT_CHANNEL_SLUG;
    const locale = cachedLocale || DEFAULT_LOCALE;
    response.cookies.set('channel', channel, { path: '/' });
    response.cookies.set('i18next', locale, { path: '/' });
    return response;
}

export const config = {
    matcher: `/((?!api|_next/static|_next/image|favicon.ico).*)`,
};
