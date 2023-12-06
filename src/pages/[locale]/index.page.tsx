import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Layout } from '@/src/layouts';
import type { InferGetStaticPropsType } from 'next';
import { storefrontApiQuery } from '@/src/graphql/client';
import { ProductTileSelector } from '@/src/graphql/selectors';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { TH1 } from '@/src/components/atoms/TypoGraphy';
import { getCollections } from '@/src/graphql/sharedQueries';
import { MainGrid } from '@/src/components/atoms/MainGrid';

export const Index: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('homepage');
    return (
        <Layout categories={props.collections} pageTitle="HomePage">
            <ContentContainer>
                <TH1>{t('most-wanted')}</TH1>
                <MainGrid>
                    {props.products.map(p => {
                        return <ProductTile product={p} key={p.id} />;
                    })}
                </MainGrid>
            </ContentContainer>
        </Layout>
    );
};

const getStaticProps = async (ctx: ContextModel) => {
    const products = await storefrontApiQuery({
        products: [
            { options: {} },
            {
                items: ProductTileSelector,
            },
        ],
    });
    const collections = await getCollections();
    const sprops = makeStaticProps(['common', 'homepage']);
    const r = await sprops(ctx);
    const returnedStuff = {
        props: { ...r.props, products: products.products.items, collections },
        revalidate: 10, // In seconds
    };
    return returnedStuff;
};

export { getStaticPaths, getStaticProps };
export default Index;
