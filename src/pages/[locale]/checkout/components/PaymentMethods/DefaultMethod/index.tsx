import { TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { AvailablePaymentMethodsType } from '@/src/graphql/selectors';
import { CreditCard } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Stack } from '@/src/components/atoms/Stack';

export const DefaultMethod = ({
    defaultMethod,
    onClick,
}: {
    defaultMethod: AvailablePaymentMethodsType;
    onClick: (method: string) => Promise<void>;
}) => {
    const { t } = useTranslation('checkout');

    return defaultMethod ? (
        <Stack column itemsCenter gap="1.25rem">
            <TP>{t('paymentMethod.title')}</TP>
            <Button key={defaultMethod.code} onClick={async () => await onClick(defaultMethod.code)}>
                <CreditCard />
                <TP>{defaultMethod.name}</TP>
            </Button>
        </Stack>
    ) : (
        <TP>{t('paymentMethod.notAvailable')}</TP>
    );
};
