import { useChannels } from '@/src/state/channels';
import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Stack, ContentContainer, MainGrid } from '@/src/components/atoms';
import { BestOf } from '@/src/components/molecules/BestOf';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { Hero } from '@/src/components/organisms/Hero';
import { MainBar } from '@/src/components/organisms/MainBar';
import { Layout } from '@/src/layouts';
import { Picker } from '../../organisms/Picker';
import type { getStaticProps } from './props';

const Main = styled(Stack)`
    padding: 0 0 4rem 0;
`;

export const Home: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('homepage');
    const { channel, locale } = useChannels();
    console.log(channel, locale);
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(true)}>Open</button>
            {open && <Picker onClosePicker={() => setOpen(false)} />}
            <Layout navigation={props.navigation} categories={props.categories} pageTitle={t('seo.home')}>
                <Main w100 column gap="4rem">
                    <Hero
                        cta={t('hero-cta')}
                        h1={t('hero-h1')}
                        h2={t('hero-h2')}
                        desc={t('hero-p')}
                        link="/collections/all"
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
                                    <ProductTile lazy collections={props.categories} product={p} key={p.slug} />
                                ))}
                            </MainGrid>
                        </Stack>
                    </ContentContainer>
                </Main>
            </Layout>
        </>
    );
};
