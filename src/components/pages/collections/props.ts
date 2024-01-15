import { SSGQuery } from '@/src/graphql/client';
import { CollectionSelector, SearchSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { ContextModel, makeStaticProps } from '@/src/lib/getStatic';
import { PER_PAGE, reduceFacets } from '@/src/state/collection/utils';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortOrder } from '@/src/zeus';

export const getStaticProps = async (context: ContextModel<{ slug?: string[] }>) => {
    const { slug } = context.params || {};
    const lastIndexSlug = slug?.length ? slug[slug.length - 1] : '';
    const _context = {
        ...context,
        params: { ...context.params, slug: lastIndexSlug },
    };

    const r = await makeStaticProps(['common', 'collections'])(_context);
    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);
    const api = SSGQuery(r.context);

    const { collection } = await api({
        collection: [{ slug: lastIndexSlug }, CollectionSelector],
    });
    if (!collection) return { notFound: true };

    const productsQuery = await api({
        search: [
            {
                input: {
                    collectionSlug: lastIndexSlug,
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
        name: collections.find(c => c.slug === lastIndexSlug)?.name,
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
