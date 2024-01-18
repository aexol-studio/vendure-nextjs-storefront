import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Stack, ContentContainer } from '@/src/components/atoms';
import { HomePageSliders } from '@/src/components/organisms/HomePageSliders';
import { Hero } from '@/src/components/organisms/Hero';
import { Layout } from '@/src/layouts';
import type { getStaticProps } from './props';

const Main = styled(Stack)`
    padding: 0 0 4rem 0;
`;

export const Home: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('homepage');

    return (
        <Layout navigation={props.navigation} categories={props.categories} pageTitle={t('seo.home')}>
            <Main w100 column gap="4rem">
                <Hero
                    cta={t('hero-cta')}
                    h1={t('hero-h1')}
                    h2={t('hero-h2')}
                    desc={t('hero-p')}
                    link="/collections/all"
                    image={
                        props.products?.find(p => p.slug.includes('laptop'))?.productAsset?.preview ??
                        (props.products[0]?.productAsset?.preview || '')
                    }
                />
                <ContentContainer>
                    <HomePageSliders sliders={props.sliders} seeAllText={t('see-all')} />
                </ContentContainer>
            </Main>
        </Layout>
    );
};
