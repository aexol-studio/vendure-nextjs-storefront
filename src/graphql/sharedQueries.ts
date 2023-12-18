import { storefrontApiQuery } from '@/src/graphql/client';
import { CollectionTileSelector, YAMLProductsSelector } from '@/src/graphql/selectors';
import { SortOrder } from '../zeus';

export const getCollections = () =>
    storefrontApiQuery({
        collections: [{}, { items: CollectionTileSelector }],
    }).then(d => d.collections.items);

export const getYMALProducts = () =>
    storefrontApiQuery({
        products: [{ options: { take: 4, sort: { createdAt: SortOrder.DESC } } }, { items: YAMLProductsSelector }],
    }).then(d => d.products.items);
