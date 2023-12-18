import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import {
    ActiveOrderSelector,
    ActiveOrderType,
    AvailablePaymentMethodsSelector,
    AvailablePaymentMethodsType,
} from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import React, { useEffect, useState } from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { DefaultMethod } from './PaymentMethods/DefaultMethod';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { StripeForm } from './PaymentMethods/StripeForm';

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY;

interface OrderPaymentProps {}

export const OrderPayment: React.FC<OrderPaymentProps> = () => {
    const push = usePush();

    //For stripe
    const [stripe, setStripe] = useState<Stripe | null>(null);
    const [paymentIntent, setPaymentIntent] = useState<string>();

    //For payment methods
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethodsType[]>();
    const [activeOrder, setActiveOrder] = useState<ActiveOrderType>();

    useEffect(() => {
        Promise.all([
            storefrontApiQuery({ activeOrder: ActiveOrderSelector }),
            storefrontApiQuery({ eligiblePaymentMethods: AvailablePaymentMethodsSelector }),
        ]).then(async ([{ activeOrder }, { eligiblePaymentMethods }]) => {
            if (activeOrder) setActiveOrder(activeOrder);
            if (eligiblePaymentMethods) {
                setAvailablePaymentMethods(eligiblePaymentMethods);

                //ONLY IF STRIPE IS AVAILABLE AND STRIPE IS IN THE LIST OF PAYMENT METHODS
                if (STRIPE_PUBLIC_KEY && eligiblePaymentMethods.find(m => m.code === 'stripe')) {
                    const stripePromise = await loadStripe(STRIPE_PUBLIC_KEY);
                    if (stripePromise) {
                        setStripe(stripePromise);
                        const { createStripePaymentIntent } = await storefrontApiMutation({
                            createStripePaymentIntent: true,
                        });
                        if (createStripePaymentIntent) setPaymentIntent(createStripePaymentIntent);
                    }
                }
            }
        });
    }, []);

    const onClick = async (method: string) => {
        // Add payment to order
        const { addPaymentToOrder } = await storefrontApiMutation({
            addPaymentToOrder: [
                {
                    input: {
                        method,
                        metadata: {
                            // TODO: Try to add some metadata
                            shouldDecline: true,
                            shouldError: false,
                            shouldErrorOnSettle: false,
                        },
                    },
                },
                {
                    __typename: true,
                    '...on Order': ActiveOrderSelector,
                    '...on IneligiblePaymentMethodError': {
                        message: true,
                        errorCode: true,
                        eligibilityCheckerMessage: true,
                    },
                    '...on NoActiveOrderError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on OrderPaymentStateError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on OrderStateTransitionError': {
                        message: true,
                        errorCode: true,
                        fromState: true,
                        toState: true,
                        transitionError: true,
                    },
                    '...on PaymentDeclinedError': {
                        errorCode: true,
                        message: true,
                        paymentErrorMessage: true,
                    },
                    '...on PaymentFailedError': {
                        errorCode: true,
                        message: true,
                        paymentErrorMessage: true,
                    },
                },
            ],
        });
        if (addPaymentToOrder.__typename === 'Order' && addPaymentToOrder.state === 'PaymentAuthorized') {
            push(`/checkout/confirmation?code=${addPaymentToOrder.code}`);
        }
    };

    const defaultMethod = availablePaymentMethods?.find(m => m.code === 'standard-payment');
    return activeOrder ? (
        <Stack w100 column itemsCenter gap="3.5rem">
            {defaultMethod && <DefaultMethod defaultMethod={defaultMethod} onClick={onClick} />}
            {stripe && paymentIntent && (
                <Elements stripe={stripe} options={{ clientSecret: paymentIntent }}>
                    <StripeForm orderCode={activeOrder.code} />
                </Elements>
            )}
        </Stack>
    ) : null;
};
