import React, { useEffect } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { OrderSummary } from '../components/OrderSummary';
import { OrderPayment } from '../components/OrderPayment';
import { Content, Main } from '../components/ui/Shared';
import { ActiveOrderSelector, AvailablePaymentMethodsSelector } from '@/src/graphql/selectors';
import { SSRMutation, SSRQuery } from '@/src/graphql/client';
import { CheckoutLayout } from '@/src/layouts';

const PaymentPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    useEffect(() => {
        window.onpopstate = () => window.history.forward();
    }, []);

    return (
        <CheckoutLayout initialActiveOrder={props.activeOrder}>
            <Content>
                <Main>
                    <OrderPayment
                        activeOrder={props.activeOrder}
                        availablePaymentMethods={props.eligiblePaymentMethods}
                        stripeData={props.stripeData}
                    />
                    <OrderSummary />
                </Main>
            </Content>
        </CheckoutLayout>
    );
};

const getServerSideProps: GetServerSideProps = async context => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const destination = r.props._nextI18Next?.initialLocale === 'en' ? '/' : `/${r.props._nextI18Next?.initialLocale}`;

    try {
        const [{ activeOrder }, { eligiblePaymentMethods }] = await Promise.all([
            SSRQuery(context)({ activeOrder: ActiveOrderSelector }),
            SSRQuery(context)({ eligiblePaymentMethods: AvailablePaymentMethodsSelector }),
        ]);

        //If no active order, redirect to homepage
        if (!activeOrder) throw new Error('No active order');
        //If stripe is available, create a payment intent
        let paymentIntent = null;
        if (eligiblePaymentMethods.find(method => method?.code === 'stripe')) {
            const { createStripePaymentIntent } = await SSRMutation(context)({
                createStripePaymentIntent: true,
            });
            paymentIntent = createStripePaymentIntent;
        }

        const returnedStuff = {
            ...r.props,
            activeOrder,
            eligiblePaymentMethods,
            stripeData: { paymentIntent },
        };

        return { props: returnedStuff };
    } catch (e) {
        console.log('e', e);
        //If error, redirect to homepage
        return { redirect: { destination, permanent: false } };
    }
};

export { getServerSideProps };
export default PaymentPage;
