import { GetServerSidePropsContext } from 'next';
import { DEFAULT_LOCALE, channels, DEFAULT_CHANNEL } from '@/src/lib/consts';
import { ContextModel } from '@/src/lib/getStatic';

export const getContext = (ctx: ContextModel | GetServerSidePropsContext): ContextModel => {
    const channelSlug = ctx.params?.channel ?? DEFAULT_LOCALE;
    const locale = ctx.params?.locale as string;
    if (!locale) {
        const currentLocale = channels.find(c => c.slug === channelSlug)?.nationalLocale;
        const channel = channels.find(c => c.slug === channelSlug)?.channel ?? DEFAULT_CHANNEL;
        return { params: { channel, locale: currentLocale ?? DEFAULT_LOCALE } };
    }
    const channel = channels.find(c => c.slug === channelSlug)?.channel ?? DEFAULT_CHANNEL;
    return { params: { channel, locale } };
};
