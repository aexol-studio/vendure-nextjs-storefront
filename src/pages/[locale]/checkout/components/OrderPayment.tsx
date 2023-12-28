import { storefrontApiMutation } from '@/src/graphql/client';
import { AvailablePaymentMethodsType } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import React, { useEffect, useState } from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { DefaultMethod } from './PaymentMethods/DefaultMethod';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { StripeForm } from './PaymentMethods/StripeForm';
import { useCheckout } from '@/src/state/checkout';

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY;

interface OrderPaymentProps {
    availablePaymentMethods?: AvailablePaymentMethodsType[];
    stripeData?: {
        paymentIntent: string;
    };
}

export const OrderPayment: React.FC<OrderPaymentProps> = ({ availablePaymentMethods, stripeData }) => {
    const { activeOrder } = useCheckout();
    const push = usePush();
    //For stripe
    const [stripe, setStripe] = useState<Stripe | null>(null);

    useEffect(() => {
        const initStripe = async () => {
            if (STRIPE_PUBLIC_KEY) {
                const stripePromise = await loadStripe(STRIPE_PUBLIC_KEY);
                if (stripePromise) setStripe(stripePromise);
            }
        };
        if (stripeData?.paymentIntent) initStripe();
    }, []);

    const onClick = async (method: string) => {
        // Add payment to order
        try {
            const { addPaymentToOrder } = await storefrontApiMutation({
                addPaymentToOrder: [
                    {
                        input: {
                            method,
                            metadata: JSON.stringify({
                                // TODO: Try to add some metadata
                                shouldDecline: false,
                                shouldCancel: false,
                                shouldError: false,
                                shouldErrorOnSettle: true,
                            }),
                        },
                    },
                    {
                        __typename: true,
                        '...on Order': { state: true, code: true },
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
                //TODO: ADD ERROR HANDLING
                push(`/checkout/confirmation/${addPaymentToOrder.code}`);
            } else {
                console.log(addPaymentToOrder);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const defaultMethod = availablePaymentMethods?.find(m => m.code === 'standard-payment');
    return activeOrder ? (
        <Stack w100 column itemsCenter gap="3.5rem">
            {defaultMethod && <DefaultMethod defaultMethod={defaultMethod} onClick={onClick} />}
            {stripe && stripeData?.paymentIntent && (
                <Elements stripe={stripe} options={{ clientSecret: stripeData.paymentIntent }}>
                    <StripeForm activeOrder={activeOrder} />
                </Elements>
            )}
        </Stack>
    ) : null;
};
