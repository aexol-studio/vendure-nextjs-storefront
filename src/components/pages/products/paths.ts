import { storefrontApiQuery } from '@/src/graphql/client';
import { ProductSlugSelector } from '@/src/graphql/selectors';
import { localizeGetStaticPaths } from '@/src/lib/getStatic';

export const getStaticPaths = async () => {
    const resp = await storefrontApiQuery('pl')({
        products: [{}, { items: ProductSlugSelector }],
    });
    const paths = localizeGetStaticPaths(
        resp.products.items.map(product => ({
            params: { id: product.id, slug: product.slug },
        })),
    );
    return { paths, fallback: false };
};
