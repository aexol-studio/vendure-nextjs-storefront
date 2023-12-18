import { Button } from '@/src/components/molecules/Button';
import { ActiveOrderType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import React, { FormEvent } from 'react';

export const StripeForm = ({ activeOrder }: { activeOrder: ActiveOrderType }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: location.origin + `/checkout/confirmation?code=${activeOrder.code}` },
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
        <StyledForm onSubmit={handleSubmit}>
            <PaymentElement
                options={{
                    layout: { type: 'tabs' },
                    business: { name: 'Aexol' },
                    paymentMethodOrder: ['blik', 'p24'],
                    defaultValues: {
                        billingDetails: {
                            email: activeOrder?.customer?.emailAddress,
                        },
                    },
                }}
            />
            <Button type="submit">Pay</Button>
        </StyledForm>
    );
};

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 2rem;

    width: 100%;
    & > * {
        width: 100%;
    }
`;
