import { useCollection } from '@/src/state/collection';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { ContentContainer, Stack, TP, MainGrid } from '@/src/components/atoms';
import { IconButton } from '@/src/components/molecules/Button';
import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { Pagination } from '@/src/components/molecules/Pagination';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { SortBy } from '@/src/components/molecules/SortBy';
import { MainBar } from '@/src/components/organisms/MainBar';
import { getServerSideProps } from './props';
import { Layout } from '@/src/layouts';

export const SearchPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('collections');
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
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}>
                            <FacetsFilters
                                onClick={e => e.stopPropagation()}
                                initial={{ translateX: '-100%' }}
                                animate={{ translateX: '0%' }}
                                exit={{ translateX: '-100%' }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}>
                                <Stack column>
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
                        <Filters onClick={() => setFiltersOpen(true)}>
                            <TP>{t('filters')}</TP>
                            <IconButton title={t('filters')}>
                                <Filter />
                            </IconButton>
                        </Filters>
                        <SortBy sort={sort} handleSort={handleSort} />
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
