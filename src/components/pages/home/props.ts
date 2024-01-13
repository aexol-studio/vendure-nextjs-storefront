import { SSGQuery } from '@/src/graphql/client';
import { HomePageSlidersType, ProductSearchSelector, homePageSlidersSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { ContextModel, makeStaticProps } from '@/src/lib/getStatic';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortOrder } from '@/src/zeus';

const slugsOfBestOf = ['home-garden', 'electronics', 'sports-outdoor'];

export const getStaticProps = async (ctx: ContextModel) => {
    const r = await makeStaticProps(['common', 'homepage'])(ctx);
    const api = SSGQuery(r.context);

    const products = await api({
        search: [
            { input: { take: 4, groupByProduct: true, sort: { price: SortOrder.ASC } } },
            { items: ProductSearchSelector },
        ],
    });

    const sliders = await Promise.all(
        slugsOfBestOf
            .map(async slug => {
                const section = await api({
                    collection: [{ slug }, homePageSlidersSelector],
                });
                if (!section.collection) return null;
                return section.collection;
            })
            .filter((x): x is Promise<HomePageSlidersType> => !!x),
    );

    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);

    const returnedStuff = {
        props: {
            ...r.props,
            ...r.context,
            products: products.search.items,
            categories: collections,
            navigation,
            sliders,
        },
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
    };

    return returnedStuff;
};
