import { SSGQuery } from '@/src/graphql/client';
import { ProductSlugSelector } from '@/src/graphql/selectors';
import { DEFAULT_CHANNEL, channels } from '@/src/lib/consts';
import { getAllPossibleWithChannels } from '@/src/lib/getStatic';

export const getStaticPaths = async () => {
    const allPaths = getAllPossibleWithChannels();
    const resp = await Promise.all(
        allPaths.map(async path => {
            const channel = channels.find(c => c.slug === path.params.channel)?.channel ?? DEFAULT_CHANNEL;
            const { products } = await SSGQuery({ channel, locale: path.params.locale })({
                products: [{}, { items: ProductSlugSelector }],
            });

            const items: { slug: string }[] = [];

            products?.items.forEach(item => {
                item.facetValues.forEach(facetValue => {
                    items.push({ ...item, slug: `${item.slug}-${facetValue.name}` });
                });
            });
            console.log(items);

            return { items, ...path.params };
        }),
    );
    const paths = resp.flatMap(data =>
        data.items.map(item => {
            return { params: { ...data, slug: item.slug } };
        }),
    );

    console.log(paths);
    return { paths, fallback: false };
};
