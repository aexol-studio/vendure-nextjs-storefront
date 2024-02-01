import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Layout } from '@/src/layouts';
import type { getStaticProps } from '@/src/components/pages/home/props';
import { termsContent } from './terms';

export const Terms: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('homepage');
    return (
        <Layout navigation={props.navigation} categories={props.categories} pageTitle={t('seo.home')}>
            <HtmlContentTerms dangerouslySetInnerHTML={{ __html: termsContent }} />
        </Layout>
    );
};

const HtmlContentTerms = styled.section`
    word-wrap: break-word;
    overflow-wrap: break-word;
    margin: auto;
    padding: 6rem 0rem;
    max-width: 1280px;
    h1 {
        font-size: 4rem;
        margin-bottom: 4rem;
    }
    h2,
    h3 {
        font-size: 2.5rem;
        font-weight: 600;
        line-height: 120%;
        color: #000;
        margin: 4rem 0rem;
    }
    p,
    span,
    a {
        font-size: 2rem;
        line-height: 150%;
        margin: 1.4rem 0rem;
        color: #000;
    }
    a:hover {
        color: blue;
    }
    span {
        font-style: italic;
    }
    strong {
        font-size: 2rem;
        line-height: 120%;
        font-weight: 700;
        margin-bottom: 2.4rem;
    }
    li {
        font-size: 2rem;
        line-height: 150%;
        color: #000;
        list-style: inside;
        margin: 0.4rem 0rem;
    }
    ul {
        margin-bottom: 2.4rem;
    }
    @media (max-width: 1200px) {
        h1 {
            font-size: 3.2rem;
        }
        h2,
        h3 {
            font-size: 2rem;
            margin-bottom: 2.4rem;
            margin-top: 4rem;
        }
        p,
        a {
            font-size: 1.6rem;
            margin-bottom: 2.4rem;
        }
        li {
            font-size: 1.6rem;
        }
        strong {
            font-size: 1.6rem;
        }
    }
`;
