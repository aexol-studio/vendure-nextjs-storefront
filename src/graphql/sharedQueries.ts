import { storefrontApiQuery } from '@/src/graphql/client';
import { CollectionTileSelector, YAMLProductsSelector } from '@/src/graphql/selectors';
import { SortOrder } from '@/src/zeus';

export const getCollectionsPaths = () =>
    storefrontApiQuery({
        collections: [{ options: { filter: { slug: { notEq: 'search' } } } }, { items: { id: true, slug: true } }],
    }).then(d => d.collections?.items);

export const getCollections = () =>
    storefrontApiQuery({
        collections: [{ options: { filter: { slug: { notEq: 'search' } } } }, { items: CollectionTileSelector }],
    }).then(d => d.collections.items);

export const getYMALProducts = () =>
    storefrontApiQuery({
        products: [{ options: { take: 8, sort: { createdAt: SortOrder.DESC } } }, { items: YAMLProductsSelector }],
    }).then(d => d.products.items.filter(p => p.variants.length > 0));
