import React, { useEffect } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
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
        <CheckoutLayout>
            <Content>
                <Main>
                    <OrderPayment
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
    const destination = prepareSSRRedirect('/')(context);

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

        //MOST IMPORTANT PART WE HAVE TO RETURN `checkout` BECAUSE WE LOOK FOR IT IN _app.tsx
        const returnedStuff = {
            ...r.props,
            checkout: activeOrder,
            eligiblePaymentMethods,
            stripeData: { paymentIntent },
        };

        return { props: returnedStuff };
    } catch (e) {
        //If error, redirect to homepage
        return destination;
    }
};

export { getServerSideProps };
export default PaymentPage;
