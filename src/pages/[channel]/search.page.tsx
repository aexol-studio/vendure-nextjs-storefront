import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
// import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { SSRQuery } from '@/src/graphql/client';
import { CollectionSelector, FacetSelector, ProductSearchSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import styled from '@emotion/styled';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { IconButton } from '@/src/components/molecules/Button';
import { Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MainBar } from '@/src/components/organisms/MainBar';
import { arrayToTree } from '@/src/util/arrayToTree';
import { PER_PAGE, reduceFacets } from '@/src/state/collection/utils';
import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { useCollection } from '@/src/state/collection';
import { Pagination } from '@/src/components/molecules/Pagination';
import { SortBy } from '@/src/components/molecules/SortBy';
import { GraphQLTypes, SortOrder } from '@/src/zeus';

const SearchPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('common');
    const {
        searchPhrase,
        products,
        facetValues,
        filtersOpen,
        setFiltersOpen,
        paginationInfo,
        changePage,
        filters,
        applyFilter,
        removeFilter,
        sort,
        handleSort,
    } = useCollection();

    return (
        <Layout
            categories={props.collections}
            navigation={props.navigation}
            pageTitle={t('search-results') + ' ' + searchPhrase}>
            <ContentContainer>
                <AnimatePresence>
                    {filtersOpen && (
                        <Facets
                            onClick={() => setFiltersOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}>
                            <FacetsFilters
                                onClick={e => e.stopPropagation()}
                                initial={{ translateX: '-100%' }}
                                animate={{ translateX: '0%' }}
                                exit={{ translateX: '-100%' }}>
                                <Stack column gap="3rem">
                                    <Stack justifyBetween itemsCenter>
                                        <TP weight={400} upperCase>
                                            {t('filters')}
                                        </TP>
                                        <IconButton onClick={() => setFiltersOpen(false)}>
                                            <X />
                                        </IconButton>
                                    </Stack>
                                    <Stack column>
                                        {facetValues?.map(f => (
                                            <FacetFilterCheckbox
                                                facet={f}
                                                key={f.code}
                                                selected={filters[f.id]}
                                                onClick={(group, value) => {
                                                    if (filters[group.id]?.includes(value.id))
                                                        removeFilter(group, value);
                                                    else applyFilter(group, value);
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Stack>
                            </FacetsFilters>
                        </Facets>
                    )}
                </AnimatePresence>
                <Main gap="2rem" column>
                    <MainBar categories={props.collections} title={t('search-results') + ' ' + searchPhrase} />
                    <Stack itemsCenter gap="2.5rem" justifyEnd w100>
                        <SortBy sort={sort} handleSort={handleSort} />
                        <Filters onClick={() => setFiltersOpen(true)}>
                            <TP>{t('filters')}</TP>
                            <IconButton title={t('filters')}>
                                <Filter />
                            </IconButton>
                        </Filters>
                    </Stack>
                    <MainGrid>
                        {products?.map(p => <ProductTile collections={props.collections} product={p} key={p.slug} />)}
                    </MainGrid>
                    <Pagination
                        page={paginationInfo.currentPage}
                        changePage={changePage}
                        totalPages={paginationInfo.totalPages}
                    />
                </Main>
            </ContentContainer>
        </Layout>
    );
};

const Filters = styled(Stack)`
    width: auto;
    cursor: pointer;
`;

const Main = styled(Stack)`
    padding: 3.5rem 0;
`;
const Facets = styled(motion.div)`
    background: ${p => p.theme.grayAlpha(900, 0.5)};
    position: fixed;
    inset: 0;
    z-index: 2138;
`;
const FacetsFilters = styled(motion.div)`
    background: ${p => p.theme.gray(0)};
    position: absolute;
    top: 0;
    bottom: 0;
    padding: 2rem;
    left: 0;
    z-index: 1;
    overflow-y: auto;
`;

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common'])(context);
    const language = (context.params?.locale as string) ?? 'en';
    const params = {
        locale: r.context.locale,
        channel: r.context.channel,
    };

    const collections = await getCollections(params);
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
    const { collection } = await SSRQuery(context)({
        collection: [{ slug: 'search' }, CollectionSelector],
    });
    const filters: { [key: string]: string[] } = {};
    const facetsQuery = await SSRQuery(context)({
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
    const productsQuery = await SSRQuery(context)({
        search: [{ input }, { items: ProductSearchSelector, totalItems: true }],
    });
    const returnedStuff = {
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
        ...r.props,
    };

    return { props: returnedStuff };
};
export { getServerSideProps };
export default SearchPage;
