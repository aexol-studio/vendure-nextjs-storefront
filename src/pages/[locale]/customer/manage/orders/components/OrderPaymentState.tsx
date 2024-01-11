import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { PaymentType } from '@/src/graphql/selectors';
import { CreditCard } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'next-i18next';

interface Props {
    payment?: PaymentType;
}

const validPaymentStates = ['Authorized', 'Settled', 'Declined'] as const;
//TODO: Add all possible payment states

export const OrderPaymentState: React.FC<Props> = ({ payment }) => {
    const { t } = useTranslation('common');
    if (!payment) return null;

    return (
        <Stack column gap="0.75rem">
            <Stack gap="0.5rem" itemsCenter>
                <CreditCard size={20} />
                {validPaymentStates.includes(payment.state as (typeof validPaymentStates)[number]) && (
                    <TP weight={500} size="1rem">
                        {t(`paymentStates.${payment.state as (typeof validPaymentStates)[number]}`)}
                    </TP>
                )}
            </Stack>
        </Stack>
    );
};
