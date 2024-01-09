import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Layout } from '@/src/layouts';
import type { InferGetStaticPropsType } from 'next';
import { storefrontApiQuery } from '@/src/graphql/client';
import { ProductSearchSelector } from '@/src/graphql/selectors';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { getCollections } from '@/src/graphql/sharedQueries';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Hero } from '@/src/components/organisms/Hero';
import { Stack } from '@/src/components/atoms/Stack';
import { MainBar } from '@/src/components/organisms/MainBar';
import { BestOf } from '@/src/components/molecules/BestOf';
import { arrayToTree } from '@/src/util/arrayToTree';
import styled from '@emotion/styled';
import { SortOrder } from '@/src/zeus';

export const Index: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('homepage');

    return (
        <Layout navigation={props.navigation} categories={props.categories} pageTitle={t('seo.home')}>
            <Main w100 column gap="4rem">
                <Hero
                    cta={t('hero-cta')}
                    h1={t('hero-h1')}
                    h2={t('hero-h2')}
                    desc={t('hero-p')}
                    link="/collections/electronics"
                    image={
                        props.products.find(p => p.slug.includes('laptop'))?.productAsset?.preview ??
                        (props.products[0]?.productAsset?.preview || '')
                    }
                />
                <ContentContainer>
                    <Stack gap="4rem" column>
                        <BestOf products={props.bestOf} />
                        <MainBar title={t('most-wanted')} categories={props.categories} />
                        <MainGrid>
                            {props.products.map(p => (
                                <ProductTile collections={props.categories} product={p} key={p.slug} />
                            ))}
                        </MainGrid>
                    </Stack>
                </ContentContainer>
            </Main>
        </Layout>
    );
};

const Main = styled(Stack)`
    padding: 0 0 4rem 0;
`;

const getStaticProps = async (ctx: ContextModel) => {
    const r = await makeStaticProps(['common', 'homepage'])(ctx);
    const language = r.props._nextI18Next?.initialLocale ?? 'en';
    const products = await storefrontApiQuery(language)({
        search: [
            { input: { take: 24, groupByProduct: true, sort: { price: SortOrder.DESC } } },
            { items: ProductSearchSelector },
        ],
    });

    const bestOf = await storefrontApiQuery(language)({
        search: [
            { input: { take: 4, groupByProduct: false, sort: { name: SortOrder.DESC }, inStock: true } },
            { items: ProductSearchSelector },
        ],
    });

    const collections = await getCollections(language);
    const navigation = arrayToTree(collections);

    const returnedStuff = {
        props: {
            ...r.props,
            products: products.search.items,
            categories: collections,
            navigation,
            bestOf: bestOf.search.items,
        },
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
    };

    return returnedStuff;
};

export { getStaticPaths, getStaticProps };
export default Index;
