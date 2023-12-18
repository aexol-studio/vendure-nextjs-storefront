import { Layout } from '@/src/layouts';
import { makeStaticProps } from '@/src/lib/getStatic';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { OrderSummary } from './components/OrderSummary';
import { OrderForm } from './components/OrderForm';
import { getCollections, getYMALProducts } from '@/src/graphql/sharedQueries';
import { Content, Main } from './components/ui/Shared';
import { VendureChain, storefrontApiQuery } from '@/src/graphql/client';
import { ActiveOrderSelector, AvailableCountriesSelector } from '@/src/graphql/selectors';

const CheckoutPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
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

const getServerSideProps: GetServerSideProps = async context => {
    const authCookies = {
        session: context.req.cookies['session'],
        'session.sig': context.req.cookies['session.sig'],
    };

    try {
        const { activeOrder } = await VendureChain(`${process.env.NEXT_PUBLIC_VENDURE_HOST}/shop-api`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                Cookie: `session=${authCookies.session}; session.sig=${authCookies['session.sig']}`,
                'Content-Type': 'application/json',
            },
        })('query')({
            activeOrder: ActiveOrderSelector,
        });
        console.log('activeOrder', activeOrder);
    } catch (e) {
        console.log('error', e);
    }

    const r = await makeStaticProps(['common', 'checkout'])({
        params: { locale: (context.params?.locale as string) || 'en' },
    });
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

    return { props: returnedStuff };
};

export { getServerSideProps };
export default CheckoutPage;
