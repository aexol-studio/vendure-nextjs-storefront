import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Layout } from '@/src/layouts';
import type { InferGetStaticPropsType } from 'next';
import { storefrontApiQuery } from '@/src/graphql/client';
import { ProductSearchSelector } from '@/src/graphql/selectors';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { TCategory } from '@/src/components/atoms/TypoGraphy';
import { getCollections } from '@/src/graphql/sharedQueries';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Hero } from '@/src/components/organisms/Hero';
import { Stack } from '@/src/components/atoms/Stack';

export const Index: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('homepage');
    return (
        <Layout categories={props.collections} pageTitle="HomePage">
            <Stack column gap="4rem">
                <Hero
                    cta={t('hero-cta')}
                    h1={t('hero-h1')}
                    h2={t('hero-h2')}
                    desc={t('hero-p')}
                    link="/collections/electronics"
                    image={props.products[0].productAsset?.preview || ''}
                />
                <ContentContainer>
                    <Stack gap="4rem" column>
                        <TCategory>{t('most-wanted')}</TCategory>
                        <MainGrid>
                            {props.products.map(p => {
                                return <ProductTile collections={props.collections} product={p} key={p.slug} />;
                            })}
                        </MainGrid>
                    </Stack>
                </ContentContainer>
            </Stack>
        </Layout>
    );
};

const getStaticProps = async (ctx: ContextModel) => {
    const products = await storefrontApiQuery({
        search: [
            {
                input: {
                    take: 12,
                    groupByProduct: true,
                },
            },
            {
                items: ProductSearchSelector,
            },
        ],
    });
    const collections = await getCollections();
    const sprops = makeStaticProps(['common', 'homepage']);
    const r = await sprops(ctx);
    const returnedStuff = {
        props: { ...r.props, products: products.search.items, collections },
        revalidate: 10, // In seconds
    };
    return returnedStuff;
};

export { getStaticPaths, getStaticProps };
export default Index;
