import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import React from 'react';
import type { InferGetStaticPropsType } from 'next';
import { SSGQuery } from '@/src/graphql/client';
import { ProductSearchSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortOrder } from '@/src/zeus';

import Home from '@/src/components/pages/Home';

export const Index: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <Home {...props} />;

const getStaticProps = async (ctx: ContextModel) => {
    const r = await makeStaticProps(['common', 'homepage'])(ctx);
    const params = {
        locale: r.context.locale,
        channel: r.context.channel,
    };
    const api = SSGQuery(params);

    const products = await api({
        search: [
            { input: { take: 24, groupByProduct: true, sort: { price: SortOrder.DESC } } },
            { items: ProductSearchSelector },
        ],
    });

    const bestOf = await api({
        search: [
            { input: { take: 4, groupByProduct: false, sort: { name: SortOrder.DESC }, inStock: true } },
            { items: ProductSearchSelector },
        ],
    });

    const collections = await getCollections(params);
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

export { getStaticPaths, getStaticProps };
export default Index;
