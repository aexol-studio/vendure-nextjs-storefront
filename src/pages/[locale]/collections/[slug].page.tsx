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
import { ContextModel, makeStaticProps } from '@/src/lib/getStatic';
import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { IconButton } from '@/src/components/molecules/Button';
import { Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('common');
    const [filtersOpen, setFiltersOpen] = useState(false);
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
                                            <FacetFilterCheckbox facet={f} key={f.code} />
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
                        {props.products?.map(p => {
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
    const paths = resp.map(collection => ({
        params: { id: collection.id, slug: collection.slug },
    }));
    return { paths, fallback: false };
};

export const getStaticProps = async (context: ContextModel<{ slug?: string }>) => {
    const { slug } = context.params || {};
    const r = await makeStaticProps(['common'])(context);
    const collections = await getCollections();
    const facets = await storefrontApiQuery({
        facets: [
            {},
            {
                items: FacetSelector,
            },
        ],
    });
    const productsQuery = await storefrontApiQuery({
        search: [
            { input: { collectionSlug: slug, groupByProduct: true } },
            {
                items: ProductSearchSelector,
            },
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

export default ProductPage;
