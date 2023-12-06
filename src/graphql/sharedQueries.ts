import { storefrontApiQuery } from '@/src/graphql/client';
import { CollectionTileSelector } from '@/src/graphql/selectors';

export const getCollections = () =>
    storefrontApiQuery({
        collections: [{}, { items: CollectionTileSelector }],
    }).then(d => d.collections.items);
