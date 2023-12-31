import { storefrontApiQuery } from '@/src/graphql/client';
import {
    CollectionTileSelector,
    CollectionTileProductVariantType,
    CollectionTileProductVariantSelector,
    YAMLProductsSelector,
} from '@/src/graphql/selectors';
import { SortOrder } from '@/src/zeus';

export const getCollectionsPaths = () =>
    storefrontApiQuery({
        collections: [{ options: { filter: { slug: { notEq: 'search' } } } }, { items: { id: true, slug: true } }],
    }).then(d => d.collections?.items);

export const getCollections = async () => {
    const _collections = await storefrontApiQuery({
        collections: [{ options: { filter: { slug: { notEq: 'search' } } } }, { items: CollectionTileSelector }],
    });

    let variantForCollections: {
        id: string;
        productVariants?: { totalItems: number; items: CollectionTileProductVariantType[] };
    }[] = [];

    try {
        variantForCollections = await Promise.all(
            _collections.collections.items.map(async c => {
                const products = await storefrontApiQuery({
                    collection: [
                        { slug: c.slug },
                        {
                            productVariants: [
                                { options: { take: 2, filter: { priceWithTax: { lte: 5000 } } } },
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

export const getYMALProducts = () =>
    storefrontApiQuery({
        products: [{ options: { take: 8, sort: { createdAt: SortOrder.DESC } } }, { items: YAMLProductsSelector }],
    }).then(d => d.products.items.filter(p => p.variants.length > 0));
