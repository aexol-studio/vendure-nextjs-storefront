import { SSGQuery } from '@/src/graphql/client';
import {
    CollectionTileSelector,
    CollectionTileProductVariantType,
    CollectionTileProductVariantSelector,
} from '@/src/graphql/selectors';
import { SortOrder } from '@/src/zeus';

export const getCollectionsPaths = () =>
    SSGQuery({ channel: 'pl-channel', locale: 'pl' })({
        collections: [
            { options: { filter: { slug: { notEq: 'search' } }, topLevelOnly: true } },
            { items: { id: true, slug: true, children: { id: true, slug: true } } },
        ],
    }).then(d => {
        const routes = d.collections?.items
            .map(c => {
                const fullPaths = c.children?.map(child => ({
                    params: { id: child.id, slug: [c.slug, child.slug] },
                }));
                fullPaths?.push({ params: { id: c.id, slug: [c.slug] } });
                return fullPaths;
            })
            .flat();
        console.log(routes);
        return routes;
    });

export const getCollections = async (params: { locale: string; channel: string }) => {
    const _collections = await SSGQuery(params)({
        collections: [{ options: { filter: { slug: { notEq: 'search' } } } }, { items: CollectionTileSelector }],
    });

    let variantForCollections: {
        id: string;
        productVariants?: { totalItems: number; items: CollectionTileProductVariantType[] };
    }[] = [];

    try {
        variantForCollections = await Promise.all(
            _collections.collections.items.map(async c => {
                const products = await SSGQuery(params)({
                    collection: [
                        { slug: c.slug },
                        {
                            productVariants: [
                                { options: { take: 2, sort: { createdAt: SortOrder.ASC } } },
                                { totalItems: true, items: CollectionTileProductVariantSelector },
                            ],
                        },
                    ],
                });
                return { ...c, productVariants: products.collection?.productVariants };
            }),
        );
    } catch (e) {
        variantForCollections = [];
    }
    const collections = _collections.collections.items.map(c => {
        const collection = variantForCollections.length
            ? variantForCollections.find(p => p.id === c.id)
            : { productVariants: { items: [], totalItems: 0 } };

        return { ...c, productVariants: collection?.productVariants };
    });

    return collections;
};
