import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_CHANNEL, DEFAULT_CHANNEL_SLUG, channels } from './lib/consts';
import { getAllPossibleWithChannels } from './lib/getStatic';

export function middleware(request: NextRequest) {
    console.log(request.nextUrl);
    const url = new URL(request.nextUrl).pathname;
    const allLocales = getAllPossibleWithChannels().map(x => x.params.locale);
    const cookies = request.cookies;
    const channel = cookies.get('channel')?.value || DEFAULT_CHANNEL;
    const channelSlug = channels.find(ch => ch.channel === channel)?.slug;
    const split = url.split('/').filter(x => x !== '');
    if (split.includes(channelSlug || '')) {
        const locale = split[split.indexOf(channelSlug || '') + 1];
        console.log(locale);
        const isLocaleValid = locale ? allLocales.includes(locale) : false;
        console.log(isLocaleValid);
        if (!isLocaleValid && channelSlug === DEFAULT_CHANNEL_SLUG) {
            // set cookie
            console.log('here', request.url);

            const replaced = request.url.replace(`/${channelSlug}`, ``);
            console.log(replaced);
            return NextResponse.redirect(new URL(replaced), { status: 308 });
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: `/((?!${DEFAULT_CHANNEL_SLUG}|_next/static|_next/image|favicon.ico).*)}))`,
    // matcher: [
    //     /*
    //      * Match all request paths except for the ones starting with:
    //      * - api (API routes)
    //      * - _next/static (static files)
    //      * - _next/image (image optimization files)
    //      * - favicon.ico (favicon file)
    //      */
    //     '/((?!api|_next/static|_next/image|favicon.ico).*)',
    //   ],
};
