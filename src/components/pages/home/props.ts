import { SSGQuery } from '@/src/graphql/client';
import { ProductSearchSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { ContextModel, makeStaticProps } from '@/src/lib/getStatic';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortOrder } from '@/src/zeus';

export const getStaticProps = async (ctx: ContextModel) => {
    const r = await makeStaticProps(['common', 'homepage'])(ctx);
    const api = SSGQuery(r.context);

    const products = await api({
        search: [
            { input: { take: 24, groupByProduct: true, sort: { price: SortOrder.DESC } } },
            { items: ProductSearchSelector },
        ],
    });

    const bestOf = await api({
        search: [
            {
                input: {
                    take: 4,
                    groupByProduct: false,
                    collectionSlug: 'home-garden',
                    sort: { name: SortOrder.DESC },
                    inStock: true,
                },
            },
            { items: ProductSearchSelector },
        ],
    });

    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);

    const returnedStuff = {
        props: {
            ...r.props,
            ...r.context,
            products: products.search.items,
            categories: collections,
            navigation,
            bestOf: bestOf.search.items,
        },
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
    };

    return returnedStuff;
};
