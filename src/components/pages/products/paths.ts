import { SSGQuery } from '@/src/graphql/client';
import { ProductSlugSelector } from '@/src/graphql/selectors';
import { DEFAULT_CHANNEL, DEFAULT_LOCALE } from '@/src/lib/consts';
import { localizeGetStaticPaths } from '@/src/lib/getStatic';

export const getStaticPaths = async () => {
    const resp = await SSGQuery({ channel: DEFAULT_CHANNEL, locale: DEFAULT_LOCALE })({
        products: [{}, { items: ProductSlugSelector }],
    });
    const paths = localizeGetStaticPaths(
        resp.products.items.map(product => ({
            params: { id: product.id, slug: product.slug },
        })),
    );
    return { paths, fallback: false };
};
