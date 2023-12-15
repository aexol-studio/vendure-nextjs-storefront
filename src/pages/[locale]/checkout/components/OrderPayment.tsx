import { TP } from '@/src/components/atoms/TypoGraphy';
import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import {
    ActiveOrderSelector,
    ActiveOrderType,
    AvailablePaymentMethodsSelector,
    AvailablePaymentMethodsType,
} from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Stack } from '@/src/components/atoms/Stack';
import { PaymentMethods } from './PaymentMethods';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface OrderPaymentProps {}

export const OrderPayment: React.FC<OrderPaymentProps> = () => {
    const [stripe, setStripe] = useState<Stripe | null>(null);
    const { t } = useTranslation('checkout');
    const push = usePush();
    const [activeOrder, setActiveOrder] = useState<ActiveOrderType>();
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethodsType[]>();
    const [paymentIntent, setPaymentIntent] = useState<string>();
    useEffect(() => {
        const getS = async () => {
            const stripePromise = await loadStripe(
                'pk_test_51OMG4WLcqyPAKon24CcmK4SRravgPqpCeSDTmtUi7WjUZiXx7zZMTWOvzz4iRzMrwBLpBli3ybHPWQa4I8bjSNVR00UCyr6KnY',
            );
            if (stripePromise) {
                setStripe(stripePromise);
                const { createStripePaymentIntent } = await storefrontApiMutation({
                    createStripePaymentIntent: true,
                });
                if (createStripePaymentIntent) {
                    setPaymentIntent(createStripePaymentIntent);
                }
            }
        };
        getS();
        storefrontApiQuery({
            activeOrder: ActiveOrderSelector,
        }).then(response => {
            if (response?.activeOrder) {
                setActiveOrder(response.activeOrder);
            }
        });

        storefrontApiQuery({
            eligiblePaymentMethods: AvailablePaymentMethodsSelector,
        }).then(response => {
            if (response?.eligiblePaymentMethods) {
                console.log(response.eligiblePaymentMethods);
                setAvailablePaymentMethods(response.eligiblePaymentMethods);
            }
        });
    }, []);
    console.log(activeOrder);

    const onClick = async (method: string) => {
        // Add payment to order
        const { addPaymentToOrder } = await storefrontApiMutation({
            addPaymentToOrder: [
                {
                    input: {
                        method,
                        metadata: {
                            // TODO: Try to add some metadata
                            // shouldDecline: true,
                            // shouldError: false,
                            // shouldErrorOnSettle: true,
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
    console.log(paymentIntent, stripe);
    return (
        <Stack>
            <Elements stripe={stripe} options={{ clientSecret: paymentIntent }}>
                <CheckoutForm orderCode={''} />
            </Elements>
            <Stack column itemsCenter gap="1.25rem">
                <TP>{t('paymentMethod.title')}</TP>
                <PaymentMethods availablePaymentMethods={availablePaymentMethods} onClick={onClick} />
            </Stack>
        </Stack>
    );
};

const CheckoutForm = ({ orderCode }: { orderCode: string }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: FormEvent) => {
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        const result = await stripe.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: location.origin + `/checkout/confirmation?code=${orderCode}`,
            },
        });

        if (result.error) {
            // Show error to your customer (for example, payment details incomplete)
            console.log(result.error.message);
        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
        </form>
    );
};
