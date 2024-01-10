import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { storefrontApiQuery } from '@/src/graphql/client';
import { CollectionSelector, SearchSelector } from '@/src/graphql/selectors';
import { getCollections, getCollectionsPaths } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { ContextModel, localizeGetStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { IconButton } from '@/src/components/molecules/Button';
import { Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pagination } from '@/src/components/molecules/Pagination';
import { ProductImageWithInfo } from '@/src/components/molecules/ProductImageWithInfo';
import { Breadcrumbs } from '@/src/components/molecules/Breadcrumbs';

import { useCollection } from '@/src/state/collection';
import { PER_PAGE, reduceFacets } from '@/src/state/collection/utils';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortBy } from '@/src/components/molecules/SortBy';
import { SortOrder } from '@/src/zeus';
const CollectionPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('common');
    const {
        collection,
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

    const breadcrumbs = [
        {
            name: t('home'),
            href: '/',
        },
        {
            name: props.collection?.parent?.name,
            href: `/collections/${props.collection?.parent?.slug}`,
        },
        {
            name: props.collection?.name,
            href: `/collections/${props.collection?.slug}`,
        },
    ].filter(b => b.name !== '__root_collection__');

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
                <RelativeStack gap="2rem" column>
                    <ScrollPoint id="collection-scroll" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                    {collection?.children && collection.children.length > 0 ? (
                        <Stack column gap="1.25rem">
                            <TH2>{t('related-collections')}</TH2>
                            <Stack itemsCenter gap="2rem">
                                {collection.children.map(col => (
                                    <ProductImageWithInfo
                                        key={col.name}
                                        href={`/collections/${col.slug}`}
                                        imageSrc={col.featuredAsset?.preview}
                                        size="tile"
                                        text={col.name}
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    ) : null}
                    <Wrapper justifyBetween>
                        <Stack itemsEnd>
                            <TH1>{collection?.name}</TH1>
                        </Stack>
                        <Stack justifyEnd itemsCenter gap="2.5rem">
                            <SortBy sort={sort} handleSort={handleSort} />
                            <Filters onClick={() => setFiltersOpen(true)}>
                                <TP>{t('filters')}</TP>
                                <IconButton title={t('filters')}>
                                    <Filter />
                                </IconButton>
                            </Filters>
                        </Stack>
                    </Wrapper>
                    <MainGrid>
                        {products?.map(p => <ProductTile collections={props.collections} product={p} key={p.slug} />)}
                    </MainGrid>
                    <Pagination
                        page={paginationInfo.currentPage}
                        changePage={changePage}
                        totalPages={paginationInfo.totalPages}
                    />
                </RelativeStack>
            </ContentContainer>
        </Layout>
    );
};

const Wrapper = styled(Stack)`
    flex-direction: column;
    gap: 2rem;
    @media (min-width: ${p => p.theme.breakpoints.xl}) {
        flex-direction: row;
    }
`;

const RelativeStack = styled(Stack)`
    position: relative;
    @media (min-width: ${p => p.theme.breakpoints.xl}) {
        padding: 3.5rem 0;
    }
`;

const ScrollPoint = styled.div`
    position: absolute;
    top: -5rem;
    left: 0;
`;

const Filters = styled(Stack)`
    width: auto;
    cursor: pointer;
`;

const Facets = styled(motion.div)`
    width: 100%;
    background: ${p => p.theme.grayAlpha(900, 0.5)};
    position: fixed;
    inset: 0;
    z-index: 2138;
`;
const FacetsFilters = styled(motion.div)`
    max-width: fit-content;
    width: 100%;
    background: ${p => p.theme.gray(0)};
    position: absolute;
    top: 0;
    bottom: 0;
    padding: 2rem;
    left: 0;
    z-index: 1;
    overflow-y: auto;
`;
export const getStaticPaths = async () => {
    const resp = await getCollectionsPaths();
    const paths = localizeGetStaticPaths(
        resp.map(collection => ({
            params: { id: collection.id, slug: collection.slug },
        })),
    );
    return { paths, fallback: false };
};

export const getStaticProps = async (context: ContextModel<{ slug?: string }>) => {
    const { slug } = context.params || {};

    const r = await makeStaticProps(['common'])(context);
    const language = r.props._nextI18Next?.initialLocale ?? 'en';
    const collections = await getCollections(language);
    const navigation = arrayToTree(collections);

    const { collection } = await storefrontApiQuery(language)({
        collection: [{ slug }, CollectionSelector],
    });

    const productsQuery = await storefrontApiQuery(language)({
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
        slug: context.params?.slug,
        collections: collections,
        name: collections.find(c => c.slug === slug)?.name,
        products: productsQuery.search?.items,
        facets,
        totalProducts: productsQuery.search?.totalItems,
        collection,
        navigation,
        language,
        ...r.props,
    };

    return {
        props: returnedStuff,
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
    };
};

export default CollectionPage;
