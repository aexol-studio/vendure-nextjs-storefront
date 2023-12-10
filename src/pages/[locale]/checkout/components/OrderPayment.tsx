import { TP } from '@/src/components/atoms/TypoGraphy';
import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import {
    ActiveOrderSelector,
    AvailablePaymentMethodsSelector,
    AvailablePaymentMethodsType,
} from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Stack } from '@/src/components/atoms/Stack';
import { PaymentMethods } from './PaymentMethods';

export const OrderPayment = () => {
    const { t } = useTranslation('checkout');
    const push = usePush();
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethodsType[]>();

    useEffect(() => {
        storefrontApiQuery({
            eligiblePaymentMethods: AvailablePaymentMethodsSelector,
        }).then(response => {
            if (response?.eligiblePaymentMethods) {
                setAvailablePaymentMethods(response.eligiblePaymentMethods);
            }
        });
    }, []);

    const onClick = async (method: string) => {
        // Add payment to order
        const { addPaymentToOrder } = await storefrontApiMutation({
            addPaymentToOrder: [
                { input: { metadata: {}, method } },
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
    return (
        <Stack>
            <Stack column itemsCenter gap="1.25rem">
                <TP>{t('paymentMethod.title')}</TP>
                <PaymentMethods availablePaymentMethods={availablePaymentMethods} onClick={onClick} />
            </Stack>
        </Stack>
    );
};
