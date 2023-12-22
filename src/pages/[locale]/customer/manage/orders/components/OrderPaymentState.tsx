import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { PaymentType } from '@/src/graphql/selectors';
import React from 'react';

interface Props {
    payment?: PaymentType;
}

export const OrderPaymentState: React.FC<Props> = ({ payment }) => {
    if (!payment) return null;
    //TODO: Add better payment state
    return (
        <Stack gap="0.75rem" itemsCenter>
            <TP>{payment.state}</TP>
            <TP>{payment.method}</TP>
        </Stack>
    );
};
