import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP } from '@/src/components/atoms/TypoGraphy';
import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { storefrontApiQuery } from '@/src/graphql/client';
import { FacetSelector, ProductTileSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { ContextModel, makeStaticProps } from '@/src/lib/getStatic';
import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from '@/src/components/molecules/Button';

const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('common');
    const [filtersOpen, setFiltersOpen] = useState(false);
    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                {filtersOpen && (
                    <Facets>
                        <FacetsFilters>
                            <Stack column gap="3rem">
                                <Stack justifyBetween>
                                    <TP weight={400} upperCase>
                                        {t('filters')}
                                    </TP>
                                    <Button onClick={() => setFiltersOpen(false)}>X</Button>
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
                <Stack gap="2rem" column>
                    <Stack justifyBetween>
                        <TH1>{props.name}</TH1>
                        <Button onClick={() => setFiltersOpen(true)}>{t('filters')}</Button>
                    </Stack>
                    <MainGrid>
                        {props.products?.map(p => {
                            return <ProductTile product={p} key={p.id} />;
                        })}
                    </MainGrid>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const Facets = styled.div`
    background: ${p => p.theme.grayAlpha(900, 0.5)};
    position: fixed;
    inset: 0;
    z-index: 1;
`;
const FacetsFilters = styled.div`
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
        collection: [
            { slug },
            {
                productVariants: [
                    {},
                    {
                        items: {
                            product: ProductTileSelector,
                        },
                    },
                ],
            },
        ],
    });
    const returnedStuff = {
        slug: context.params?.slug,
        collections: collections,
        name: collections.find(c => c.slug === slug)?.name,
        products: productsQuery.collection?.productVariants.items.map(p => p.product),
        facets: facets.facets.items,
        ...r.props,
    };
    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export default ProductPage;
