import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Stack } from '@/src/components/atoms/Stack';
import { TH1 } from '@/src/components/atoms/TypoGraphy';
import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { storefrontApiQuery } from '@/src/graphql/client';
import { FacetSelector, ProductTileSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { ContextModel, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';

const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack>
                    <Stack column>
                        {props.facets.map(f => (
                            <FacetFilterCheckbox facet={f} key={f.code} />
                        ))}
                    </Stack>
                    <Stack gap="2rem" column>
                        <TH1>{props.name}</TH1>
                        <MainGrid>
                            {props.products?.map(p => {
                                return <ProductTile product={p} key={p.id} />;
                            })}
                        </MainGrid>
                    </Stack>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

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
