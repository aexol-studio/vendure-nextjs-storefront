import { TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { AvailablePaymentMethodsType } from '@/src/graphql/selectors';
import { CreditCard } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'next-i18next';

export const PaymentMethods = ({
    availablePaymentMethods,
    onClick,
}: {
    availablePaymentMethods?: AvailablePaymentMethodsType[];
    onClick: (method: string) => Promise<void>;
}) => {
    const { t } = useTranslation('checkout');
    // Here we are using the standard-payment method as the only available payment method.
    const standardMethod = availablePaymentMethods?.find(m => m.code === 'standard-payment');
    return standardMethod ? (
        <Button key={standardMethod.code} onClick={async () => await onClick(standardMethod.code)}>
            <CreditCard />
            <TP>{standardMethod.name}</TP>
        </Button>
    ) : (
        <TP>{t('paymentMethod.notAvailable')}</TP>
    );
};
