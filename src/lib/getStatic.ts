// import nextI18nextConfig from '@/next-i18next.config';
import { i18n } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import resources from '@/src/@types/resources';
import { GetServerSidePropsContext } from 'next';
import { DEFAULT_CHANNEL, DEFAULT_LOCALE, channels } from './consts';

const getAllPossibleWithChannels = () => {
    const paths: { params: { locale?: string; channel: string } }[] = [];
    channels.forEach(c => {
        c.locales.forEach(locale => {
            paths.push({ params: { channel: c.slug, locale } });
        });
        paths.push({ params: { channel: c.slug } });
    });
    return paths;
};
export interface ContextModel<T = Record<string, string>> {
    params: { locale: string } & T;
}

export const localizeGetStaticPaths = <T>(
    existingPaths: Array<{
        params: T;
    }>,
) => {
    const allPaths = getAllPossibleWithChannels();
    return allPaths.flatMap(locale =>
        existingPaths.map(ep => ({
            ...ep,
            params: {
                ...ep.params,
                ...locale.params,
            },
        })),
    );
};
// getI18nPaths().flatMap(locale =>
//     existingPaths.map(ep => ({
//         ...ep,
//         params: {
//             ...ep.params,
//             locale,
//         },
//     })),
// );

export async function getI18nProps(ctx: ContextModel, ns: Array<keyof typeof resources> = ['common']) {
    const locale = ctx?.params?.locale;
    if (process.env.NODE_ENV === 'development') {
        await i18n?.reloadResources();
    }
    const props = {
        ...(await serverSideTranslations(locale, ns)),
    };

    return props;
}

const getContext = (ctx: ContextModel): ContextModel => {
    const channelSlug = ctx.params?.channel ?? DEFAULT_LOCALE;
    const locale = ctx.params?.locale;
    if (!locale) {
        const currentLocale = channels.find(c => c.slug === channelSlug)?.nationalLocale;
        const channel = channels.find(c => c.slug === channelSlug)?.channel ?? DEFAULT_CHANNEL;
        return { params: { channel, locale: currentLocale ?? DEFAULT_LOCALE } };
    }
    const channel = channels.find(c => c.slug === channelSlug)?.channel ?? DEFAULT_CHANNEL;
    return { params: { channel, locale } };
};

export function makeStaticProps(ns: Array<keyof typeof resources>) {
    return async function getStaticProps(ctx: ContextModel) {
        const context = getContext(ctx);
        return {
            props: await getI18nProps(context, ns),
            context: {
                channel: context.params.channel,
                locale: context.params.locale,
            },
        };
    };
}

export function makeServerSideProps(ns: Array<keyof typeof resources>) {
    return async function getServerSideProps(context: GetServerSidePropsContext) {
        return {
            props: await getI18nProps({ params: { locale: context.locale || 'en' } }, ns),
        };
    };
}

const getStandardLocalePaths = () => {
    const paths: { params: { locale?: string; channel: string } }[] = [];
    channels.forEach(c => {
        c.locales.forEach(locale => {
            paths.push({ params: { channel: c.slug, locale } });
        });
        paths.push({ params: { channel: c.slug, locale: '' } });
    });
    return paths;
};

export const getStaticPaths = () => ({
    fallback: false,
    paths: getStandardLocalePaths(),
});

export const prepareSSRRedirect = (where: string) => (context: GetServerSidePropsContext) => {
    const locale = context.params?.locale || 'en';
    const destination = locale === 'en' ? `${where}` : `/${context.params?.locale}${where}`;
    return { redirect: { destination, permanent: false } };
};
