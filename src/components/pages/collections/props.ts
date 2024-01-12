import { SSGQuery } from '@/src/graphql/client';
import { CollectionSelector, SearchSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { ContextModel, makeStaticProps } from '@/src/lib/getStatic';
import { PER_PAGE, reduceFacets } from '@/src/state/collection/utils';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortOrder } from '@/src/zeus';

export const getStaticProps = async (context: ContextModel<{ slug?: string }>) => {
    const { slug } = context.params || {};

    const r = await makeStaticProps(['common'])(context);
    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);

    const { collection } = await SSGQuery(r.context)({
        collection: [{ slug }, CollectionSelector],
    });

    const productsQuery = await SSGQuery(r.context)({
        search: [
            {
                input: {
                    collectionSlug: slug,
                    groupByProduct: true,
                    take: PER_PAGE,
                    sort: { name: SortOrder.ASC },
                },
            },
            SearchSelector,
        ],
    });
    const facets = reduceFacets(productsQuery.search.facetValues);

    const returnedStuff = {
        ...r.props,
        ...r.context,
        slug: context.params?.slug,
        collections: collections,
        name: collections.find(c => c.slug === slug)?.name,
        products: productsQuery.search?.items,
        facets,
        totalProducts: productsQuery.search?.totalItems,
        collection,
        navigation,
    };

    return {
        props: returnedStuff,
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
    };
};
