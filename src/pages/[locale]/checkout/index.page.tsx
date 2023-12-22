import { CheckoutLayout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { OrderSummary } from './components/OrderSummary';
import { OrderForm } from './components/OrderForm';
import { getYMALProducts } from '@/src/graphql/sharedQueries';
import { Content, Main } from './components/ui/Shared';
import { SSRQuery, storefrontApiQuery } from '@/src/graphql/client';
import { ActiveOrderSelector, AvailableCountriesSelector } from '@/src/graphql/selectors';

const CheckoutPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { availableCountries, YMALProducts, initialActiveOrder } = props;

    return (
        <CheckoutLayout initialActiveOrder={initialActiveOrder}>
            <Content>
                <Main w100 justifyBetween>
                    <OrderForm availableCountries={availableCountries} />
                    <OrderSummary isForm YMALProducts={YMALProducts} />
                </Main>
            </Content>
        </CheckoutLayout>
    );
};

const getServerSideProps: GetServerSideProps = async context => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const homePageRedirect =
        r.props._nextI18Next?.initialLocale === 'en' ? '/' : `/${r.props._nextI18Next?.initialLocale}`;
    const paymentRedirect =
        r.props._nextI18Next?.initialLocale === 'en'
            ? '/checkout/payment'
            : `/${r.props._nextI18Next?.initialLocale}/checkout/payment`;

    const { availableCountries } = await storefrontApiQuery({
        availableCountries: AvailableCountriesSelector,
    });
    const YMALProducts = await getYMALProducts();

    const { activeOrder } = await SSRQuery(context)({
        activeOrder: ActiveOrderSelector,
    });

    if (activeOrder?.state === 'ArrangingPayment') {
        return { redirect: { destination: paymentRedirect, permanent: false } };
    }

    if (!activeOrder || activeOrder.lines.length === 0) {
        return { redirect: { destination: homePageRedirect, permanent: false } };
    }

    const returnedStuff = { ...r.props, availableCountries, initialActiveOrder: activeOrder, YMALProducts };
    return { props: returnedStuff };
};

export { getServerSideProps };
export default CheckoutPage;
