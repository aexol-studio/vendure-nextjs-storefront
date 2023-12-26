import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP } from '@/src/components/atoms/TypoGraphy';
import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { storefrontApiQuery } from '@/src/graphql/client';
import { FacetSelector, ProductSearchSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { ContextModel, localizeGetStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { IconButton } from '@/src/components/molecules/Button';
import { Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GraphQLTypes } from '@/src/zeus';
import { useRouter } from 'next/router';

const PER_PAGE = 24;

const CollectionPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('common');
    const { query } = useRouter();

    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [products, setProducts] = useState(props.products);
    const [filters, setFilters] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        if (query.page) setPage(parseInt(query.page as string));

        if (query && Object.keys(query).filter(k => k !== 'slug' && k !== 'page' && k !== 'locale').length) {
            const filters: { [key: string]: string[] } = {};
            Object.entries(query).forEach(([key, value]) => {
                if (key === 'slug' || !value) return;
                const facetGroup = props.facets.find(f => f.name === key);
                if (!facetGroup) return;
                const facet = facetGroup.values.find(v => v.name === value);
                if (!facet) return;
                filters[facetGroup.id] = [...(filters[facetGroup.id] || []), facet.id];
            });
            setFilters(filters);
            getFilteredProducts(filters, parseInt(query.page as string));
        }
    }, [query]);

    // const changePage = (page: number) => {
    //     const url = new URL(window.location.href);
    //     url.searchParams.set('page', page.toString());
    //     window.history.pushState({}, '', url.toString());
    //     setPage(page);
    //     getFilteredProducts(filters, page);
    // };

    const getFilteredProducts = async (state: { [key: string]: string[] }, page: number) => {
        const facetValueFilters: GraphQLTypes['FacetValueFilterInput'][] = [];

        Object.entries(state).forEach(([key, value]) => {
            const facet = props.facets.find(f => f.id === key);
            if (!facet) return;
            const filter: GraphQLTypes['FacetValueFilterInput'] = {};
            if (value.length === 1) filter.and = value[0];
            else filter.or = value;
            facetValueFilters.push(filter);
        });

        const input: GraphQLTypes['SearchInput'] = {
            collectionSlug: props.slug,
            groupByProduct: true,
            facetValueFilters,
            take: PER_PAGE * page,
            skip: PER_PAGE * (page - 1),
        };

        const { search } = await storefrontApiQuery({
            search: [{ input }, { items: ProductSearchSelector }],
        });

        setProducts(search?.items);
    };

    const applyFilter = async (group: { id: string; name: string }, value: { id: string; name: string }) => {
        const newState = { ...filters, [group.id]: [...(filters[group.id] || []), value.id] };

        const url = new URL(window.location.href);
        if (url.searchParams.get(group.name)) {
            url.searchParams.set(group.name, `${url.searchParams.get(group.name)},${value.name}`);
        } else url.searchParams.set(group.name, value.name);
        window.history.pushState({}, '', url.toString());

        setFilters(newState);
        await getFilteredProducts(newState, page);
    };

    const removeFilter = async (group: { id: string; name: string }, value: { id: string; name: string }) => {
        const newState = { ...filters, [group.id]: filters[group.id].filter(f => f !== value.id) };

        const url = new URL(window.location.href);
        if (url.searchParams.get(group.name)) {
            const values = url.searchParams.get(group.name)?.split(',');
            const filtered = values?.filter(v => v !== value.name);
            if (filtered?.length) url.searchParams.set(group.name, filtered.join(','));
            else url.searchParams.delete(group.name);
        }
        window.history.pushState({}, '', url.toString());

        setFilters(newState);
        await getFilteredProducts(newState, page);
    };

    return (
        <Layout categories={props.collections}>
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
                                        {props.facets.map(f => (
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
                <Stack gap="2rem" column>
                    <Stack justifyBetween itemsCenter>
                        <TH1>{props.name}</TH1>
                        <Filters onClick={() => setFiltersOpen(true)}>
                            <TP>{t('filters')}</TP>
                            <IconButton title={t('filters')}>
                                <Filter />
                            </IconButton>
                        </Filters>
                    </Stack>
                    <MainGrid>
                        {products?.map(p => {
                            return <ProductTile collections={props.collections} product={p} key={p.slug} />;
                        })}
                    </MainGrid>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const Filters = styled(Stack)`
    width: auto;
    cursor: pointer;
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
export const getStaticPaths = async () => {
    const resp = await getCollections();
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
    const collections = await getCollections();
    const facets = await storefrontApiQuery({
        facets: [{}, { items: FacetSelector }],
    });
    const productsQuery = await storefrontApiQuery({
        search: [
            { input: { collectionSlug: slug, groupByProduct: true, take: PER_PAGE } },
            { items: ProductSearchSelector },
        ],
    });
    const returnedStuff = {
        slug: context.params?.slug,
        collections: collections,
        name: collections.find(c => c.slug === slug)?.name,
        products: productsQuery.search?.items,
        facets: facets.facets.items,
        ...r.props,
    };
    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export default CollectionPage;
