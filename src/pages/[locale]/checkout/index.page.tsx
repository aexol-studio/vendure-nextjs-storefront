import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { OrderSummary } from './components/OrderSummary';
import { OrderForm } from './components/OrderForm';
import { getCollections, getYMALProducts } from '@/src/graphql/sharedQueries';
import { Content, Main } from './components/ui/Shared';
import { storefrontApiQuery } from '@/src/graphql/client';
import { AvailableCountriesSelector } from '@/src/graphql/selectors';

const CheckoutPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { availableCountries, YMALProducts } = props;

    return (
        <Layout categories={props.collections}>
            <Content>
                <Main w100 justifyBetween>
                    <OrderForm availableCountries={availableCountries} />
                    <OrderSummary isForm YMALProducts={YMALProducts} />
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

    const YMALProducts = await getYMALProducts();

    const returnedStuff = {
        ...r.props,
        collections,
        availableCountries,
        YMALProducts,
    };

    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export { getStaticPaths, getStaticProps };
export default CheckoutPage;
