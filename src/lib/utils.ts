import { GetServerSidePropsContext } from 'next';
import { channels, DEFAULT_CHANNEL, DEFAULT_CHANNEL_SLUG, DEFAULT_LOCALE } from '@/src/lib/consts';
import { ContextModel } from '@/src/lib/getStatic';

export const getContext = (ctx: ContextModel | GetServerSidePropsContext): ContextModel => {
    let channelSlug = ctx.params?.channel ?? DEFAULT_CHANNEL_SLUG;
    const locale = ctx.params?.locale as string;

    if ('res' in ctx) {
        //TODO: VERIFY IF IT MAKES SENSE TO USE THIS
        const channel = ctx.req.cookies['channel'];
        channelSlug = channels.find(c => c.channel === channel)?.slug ?? DEFAULT_CHANNEL_SLUG;
    }

    if (!locale) {
        const currentLocale = channels.find(c => c.slug === channelSlug)?.nationalLocale;
        const channel = channels.find(c => c.slug === channelSlug)?.channel ?? DEFAULT_CHANNEL;
        return { params: { channel, locale: currentLocale ?? DEFAULT_LOCALE } };
    }
    const channel = channels.find(c => c.slug === channelSlug)?.channel ?? DEFAULT_CHANNEL;
    return { params: { channel, locale } };
};
