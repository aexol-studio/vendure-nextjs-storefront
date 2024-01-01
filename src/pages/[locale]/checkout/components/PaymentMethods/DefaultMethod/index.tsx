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
                    onClick={async () =>
                        await onClick(defaultMethod.code, {
                            shouldCancel: false,
                            shouldDecline: false,
                            shouldError: false,
                            shouldErrorOnSettle: false,
                        })
                    }>
                    <Stack itemsCenter gap="1rem">
                        <StyledCreditCard method="success" />
                        <Text>{t('paymentMethod.success')}</Text>
                    </Stack>
                </Button>
                <Stack w100 justifyBetween itemsCenter gap="1.25rem">
                    <Button
                        onClick={async () =>
                            await onClick(defaultMethod.code, {
                                shouldCancel: false,
                                shouldDecline: true,
                                shouldError: false,
                                shouldErrorOnSettle: false,
                            })
                        }>
                        <Stack itemsCenter gap="1rem">
                            <StyledCreditCard method="decline" />
                            <Text>{t('paymentMethod.decline')}</Text>
                        </Stack>
                    </Button>
                    <Button
                        onClick={async () =>
                            await onClick(defaultMethod.code, {
                                shouldCancel: false,
                                shouldDecline: false,
                                shouldError: true,
                                shouldErrorOnSettle: false,
                            })
                        }>
                        <Stack itemsCenter gap="1rem">
                            <StyledCreditCard method="error" />
                            <Text>{t('paymentMethod.error')}</Text>
                        </Stack>
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    ) : (
        <TP>{t('paymentMethod.notAvailable')}</TP>
    );
};

const Text = styled(TP)`
    white-space: nowrap;
`;

const StyledCreditCard = styled(CreditCard)<{ method: 'success' | 'decline' | 'error' }>`
    color: ${({ theme, method }) => (method === 'success' ? theme.success : theme.error)};
`;
