import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { OrderSummary } from './components/OrderSummary';
import { OrderForm } from './components/OrderForm';
import { getYMALProducts } from '@/src/graphql/sharedQueries';
import { Content, Main } from './components/ui/Shared';
import { SSRQuery, storefrontApiQuery } from '@/src/graphql/client';
import { AvailableCountriesSelector } from '@/src/graphql/selectors';
import { useCart } from '@/src/state/cart';

const CheckoutPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { cart } = useCart();
    const { availableCountries, YMALProducts } = props;

    return (
        <Layout categories={[]}>
            <Content>
                <Main w100 justifyBetween>
                    <OrderForm activeOrder={cart} availableCountries={availableCountries} />
                    <OrderSummary activeOrder={cart} isForm YMALProducts={YMALProducts} />
                </Main>
            </Content>
        </Layout>
    );
};

const getServerSideProps: GetServerSideProps = async context => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const paymentRedirect =
        r.props._nextI18Next?.initialLocale === 'en'
            ? '/checkout/payment'
            : `/${r.props._nextI18Next?.initialLocale}/checkout/payment`;

    const { availableCountries } = await storefrontApiQuery({
        availableCountries: AvailableCountriesSelector,
    });
    const YMALProducts = await getYMALProducts();

    const { activeOrder } = await SSRQuery(context)({
        activeOrder: { state: true },
    });

    if (activeOrder?.state === 'ArrangingPayment') {
        return { redirect: { destination: paymentRedirect, permanent: false } };
    }

    const returnedStuff = {
        ...r.props,
        availableCountries,
        YMALProducts,
    };

    return { props: returnedStuff };
};

export { getServerSideProps };
export default CheckoutPage;
