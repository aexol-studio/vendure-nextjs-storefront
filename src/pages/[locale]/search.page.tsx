import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
// import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { storefrontApiQuery } from '@/src/graphql/client';
import { CollectionSelector, FacetSelector, SearchSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { IconButton } from '@/src/components/molecules/Button';
import { Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MainBar } from '@/src/components/organisms/MainBar';
import { arrayToTree } from '@/src/util/arrayToTree';
import { PER_PAGE } from '@/src/state/collection/utils';
import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { useCollection } from '@/src/state/collection';
import { Pagination } from '@/src/components/molecules/Pagination';
import { SortBy } from '@/src/components/molecules/SortBy';

const SearchPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
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
        <Layout categories={props.collections} navigation={props.navigation}>
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
                    <Stack itemsCenter gap="2.5rem">
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
    z-index: 1;
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

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common'])(context);
    const collections = await getCollections();
    const navigation = arrayToTree(collections);

    const facets = await storefrontApiQuery({
        facets: [{}, { items: FacetSelector }],
    });

    //we simulate a collection with the search slug + we skip this collection everywhere else
    const { collection } = await storefrontApiQuery({
        collection: [{ slug: 'search' }, CollectionSelector],
    });
    const productsQuery = await storefrontApiQuery({
        search: [{ input: { collectionSlug: 'search', groupByProduct: true, take: PER_PAGE } }, SearchSelector],
    });

    const returnedStuff = {
        collections,
        facets: facets.facets.items,
        navigation,
        collection,
        products: productsQuery.search.items,
        totalProducts: productsQuery.search.totalItems,
        ...r.props,
    };

    return {
        props: returnedStuff,
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
    };
};
export { getStaticProps, getStaticPaths };
export default SearchPage;
