import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { OrderSummary } from './components/OrderSummary';
import { OrderForm } from './components/OrderForm';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Content, Main } from './components/ui/Shared';
import { storefrontApiQuery } from '@/src/graphql/client';
import { AvailableCountriesSelector } from '@/src/graphql/selectors';

const CheckoutPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { availableCountries } = props;

    return (
        <Layout categories={props.collections}>
            <Content>
                <Main>
                    <OrderForm availableCountries={availableCountries} />
                    <OrderSummary />
                </Main>
            </Content>
        </Layout>
    );
};

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'checkout'])(context);
    const collections = await getCollections();

    const { availableCountries } = await storefrontApiQuery({
        availableCountries: AvailableCountriesSelector,
    });

    const returnedStuff = {
        ...r.props,
        collections,
        availableCountries,
    };

    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export { getStaticPaths, getStaticProps };
export default CheckoutPage;
