import { TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { AvailablePaymentMethodsType } from '@/src/graphql/selectors';
import { CreditCard } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';

export const DefaultMethod = ({
    defaultMethod,
    onClick,
}: {
    defaultMethod: AvailablePaymentMethodsType;
    onClick: (
        method: string,
        metadata: { shouldDecline: boolean; shouldCancel: boolean; shouldError: boolean; shouldErrorOnSettle: boolean },
    ) => Promise<void>;
}) => {
    const { t } = useTranslation('checkout');

    return defaultMethod ? (
        <Stack column itemsCenter gap="1.25rem">
            <TP>{t('paymentMethod.title')}</TP>
            <Stack w100 column justifyBetween itemsCenter gap="1.25rem">
                <Button
                    key={defaultMethod.code + 'success'}
                    onClick={async () =>
                        await onClick(defaultMethod.code, {
                            shouldCancel: false,
                            shouldDecline: false,
                            shouldError: false,
                            shouldErrorOnSettle: false,
                        })
                    }>
                    <StyledCreditCard method="success" />
                    <TP>{t('paymentMethod.success')}</TP>
                    <TP>{defaultMethod.name}</TP>
                </Button>
                <Stack w100 justifyBetween itemsCenter gap="1.25rem">
                    <Button
                        key={defaultMethod.code + 'cancel'}
                        onClick={async () =>
                            await onClick(defaultMethod.code, {
                                shouldCancel: false,
                                shouldDecline: true,
                                shouldError: false,
                                shouldErrorOnSettle: false,
                            })
                        }>
                        <StyledCreditCard method="decline" />
                        <TP>{t('paymentMethod.decline')}</TP>
                        <TP>{defaultMethod.name}</TP>
                    </Button>
                    <Button
                        key={defaultMethod.code + 'error'}
                        onClick={async () =>
                            await onClick(defaultMethod.code, {
                                shouldCancel: false,
                                shouldDecline: false,
                                shouldError: true,
                                shouldErrorOnSettle: false,
                            })
                        }>
                        <StyledCreditCard method="error" />
                        <TP>{t('paymentMethod.error')}</TP>
                        <TP>{defaultMethod.name}</TP>
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    ) : (
        <TP>{t('paymentMethod.notAvailable')}</TP>
    );
};

const StyledCreditCard = styled(CreditCard)<{ method: 'success' | 'decline' | 'error' }>`
    color: ${({ theme, method }) => (method === 'success' ? theme.success : theme.error)};
`;
