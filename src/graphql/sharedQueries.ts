import { SSGQuery } from '@/src/graphql/client';
import {
    CollectionTileSelector,
    CollectionTileProductVariantType,
    CollectionTileProductVariantSelector,
} from '@/src/graphql/selectors';
import { SortOrder } from '@/src/zeus';

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
                                { options: { take: 4, sort: { createdAt: SortOrder.ASC } } },
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
