import { storefrontApiMutation } from '@/src/graphql/client';
import { AvailablePaymentMethodsType } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import React, { useEffect, useState } from 'react';
import { Stack } from '@/src/components/atoms';
import { DefaultMethod } from './PaymentMethods/DefaultMethod';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeError } from '@stripe/stripe-js';
import { StripeForm } from './PaymentMethods/StripeForm';
import { useCheckout } from '@/src/state/checkout';
import { Banner } from '@/src/components/forms';
import { useTranslation } from 'next-i18next';

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY;

interface OrderPaymentProps {
    availablePaymentMethods?: AvailablePaymentMethodsType[];
    stripeData?: { paymentIntent: string | null };
}

export const OrderPayment: React.FC<OrderPaymentProps> = ({ availablePaymentMethods, stripeData }) => {
    const { t } = useTranslation('common');
    const { activeOrder } = useCheckout();
    const push = usePush();
    //For stripe
    const [stripe, setStripe] = useState<Stripe | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initStripe = async () => {
            if (STRIPE_PUBLIC_KEY) {
                const stripePromise = await loadStripe(STRIPE_PUBLIC_KEY);
                if (stripePromise) setStripe(stripePromise);
            }
        };
        if (stripeData?.paymentIntent) initStripe();
    }, []);

    const onClick = async (
        method: string,
        metadata: {
            shouldDecline: boolean;
            shouldCancel: boolean;
            shouldError: boolean;
            shouldErrorOnSettle: boolean;
        },
    ) => {
        // Add payment to order
        try {
            setError(null);
            const { addPaymentToOrder } = await storefrontApiMutation({
                addPaymentToOrder: [
                    { input: { method, metadata: JSON.stringify(metadata) } },
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
            if (addPaymentToOrder.__typename !== 'Order') {
                setError(t(`errors.backend.${addPaymentToOrder.errorCode}`));
            } else if (
                addPaymentToOrder.state === 'PaymentSettled' ||
                addPaymentToOrder.state === 'PaymentAuthorized'
            ) {
                push(`/checkout/confirmation/${addPaymentToOrder.code}`);
            }
        } catch (e) {
            console.log(e);
            setError(t(`errors.backend.UNKNOWN_ERROR`));
        }
    };

    const onStripeSubmit = (result: { error: StripeError }) => {
        if (!result.error) return;
        setError(t(`errors.stripe.${result.error.type}`));
    };

    const defaultMethod = availablePaymentMethods?.find(m => m.code === 'standard-payment');
    const przelewy24Method = availablePaymentMethods?.find(m => m.code === 'przelewy-24');

    const przelewy24 = async () => {
        try {
            const { addPaymentToOrder } = await storefrontApiMutation({
                addPaymentToOrder: [
                    { input: { method: 'przelewy-24', metadata: {} } },
                    {
                        __typename: true,
                        '...on Order': { state: true, code: true, payments: { metadata: true } },
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
            if (!addPaymentToOrder) {
                setError(t(`errors.backend.UNKNOWN_ERROR`));
                return;
            }
            if (addPaymentToOrder.__typename !== 'Order') {
                setError(t(`errors.backend.${addPaymentToOrder.errorCode}`));
                return;
            }
            if (!addPaymentToOrder.payments) {
                setError(t(`errors.backend.UNKNOWN_ERROR`));
                return;
            }

            if (addPaymentToOrder.payments[0].metadata.public.paymentUrl) {
                push(addPaymentToOrder.payments[0].metadata.public.paymentUrl);
            }
        } catch (e) {
            console.log(e);
        }
    };

    return activeOrder ? (
        <Stack w100 column itemsCenter gap="3.5rem">
            <Banner error={{ message: error ?? undefined }} clearErrors={() => setError(null)} />
            {defaultMethod && <DefaultMethod defaultMethod={defaultMethod} onClick={onClick} />}
            {stripe && stripeData?.paymentIntent && (
                <Elements stripe={stripe} options={{ clientSecret: stripeData.paymentIntent }}>
                    <StripeForm activeOrder={activeOrder} onStripeSubmit={onStripeSubmit} />
                </Elements>
            )}
            {przelewy24Method && <button onClick={przelewy24}>Przelewy24</button>}
        </Stack>
    ) : null;
};
