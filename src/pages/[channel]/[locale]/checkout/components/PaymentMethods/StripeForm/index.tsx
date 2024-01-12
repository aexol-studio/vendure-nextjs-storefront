import { Button } from '@/src/components/molecules/Button';
import { ActiveOrderType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';
import React, { FormEvent } from 'react';

interface StripeFormProps {
    activeOrder: ActiveOrderType;
    onStripeSubmit: (result: { error: StripeError }) => void;
}

export const StripeForm: React.FC<StripeFormProps> = ({ activeOrder, onStripeSubmit }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: location.origin + `/checkout/confirmation/${activeOrder.code}` },
        });

        onStripeSubmit(result);
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
