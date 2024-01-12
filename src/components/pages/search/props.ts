import { storefrontApiQuery } from '@/src/graphql/client';
import { CollectionSelector, FacetSelector, ProductSearchSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { PER_PAGE, reduceFacets } from '@/src/state/collection/utils';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortOrder, GraphQLTypes } from '@/src/zeus';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common'])(context);
    const language = (context.params?.locale as string) ?? 'en';

    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);

    let page = 1;
    let q = '';
    let sort = { key: 'name', direction: 'ASC' as SortOrder };
    if (context.query.sort) {
        const [key, direction] = (context.query.sort as string).split('-');
        sort = { key, direction: direction.toUpperCase() as SortOrder };
    }
    if (context.query.q) {
        q = context.query.q as string;
    }
    if (context.query.page) {
        page = parseInt(context.query.page as string);
    }

    //we simulate a collection with the search slug + we skip this collection everywhere else
    const { collection } = await storefrontApiQuery(language)({
        collection: [{ slug: 'search' }, CollectionSelector],
    });
    const filters: { [key: string]: string[] } = {};
    const facetsQuery = await storefrontApiQuery(language)({
        search: [
            { input: { term: q, collectionSlug: 'search', groupByProduct: true, take: PER_PAGE } },
            { facetValues: { count: true, facetValue: { ...FacetSelector, facet: FacetSelector } } },
        ],
    });
    const facets = reduceFacets(facetsQuery.search.facetValues);
    Object.entries(context.query).forEach(([key, value]) => {
        if (key === 'slug' || key === 'locale' || key === 'page' || key === 'sort' || !value) return;
        const facetGroup = facets.find(f => f.name === key);
        if (!facetGroup) return;
        const facet = facetGroup.values?.find(v => v.name === value);
        if (!facet) return;
        filters[facetGroup.id] = [...(filters[facetGroup.id] || []), facet.id];
    });
    const facetValueFilters: GraphQLTypes['FacetValueFilterInput'][] = [];
    Object.entries(filters).forEach(([key, value]) => {
        const facet = facets.find(f => f.id === key);
        if (!facet) return;
        const filter: GraphQLTypes['FacetValueFilterInput'] = {};
        if (value.length === 1) filter.and = value[0];
        else filter.or = value;
        facetValueFilters.push(filter);
    });
    const input = {
        term: q,
        collectionSlug: 'search',
        groupByProduct: true,
        take: PER_PAGE,
        skip: (page - 1) * PER_PAGE,
        facetValueFilters,
        sort: sort.key === 'title' ? { name: sort.direction } : { price: sort.direction },
    };
    const productsQuery = await storefrontApiQuery(language)({
        search: [{ input }, { items: ProductSearchSelector, totalItems: true }],
    });
    const returnedStuff = {
        ...r.props,
        ...r.context,
        collections,
        facets,
        navigation,
        collection,
        products: productsQuery.search.items,
        totalProducts: productsQuery.search.totalItems,
        filters,
        searchQuery: q,
        page,
        language,
    };

    return { props: returnedStuff };
};
