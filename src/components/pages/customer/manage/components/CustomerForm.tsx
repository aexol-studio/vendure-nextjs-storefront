import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { ActiveCustomerType } from '@/src/graphql/selectors';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { CustomerResetPasswordForm } from './forms/CustomerResetPasswordForm';
import { CustomerDetailsForm } from './forms/CustomerDetailsForm';
import { StyledButton } from './atoms/shared';
import { AnimatePresence } from 'framer-motion';

interface Props {
    initialCustomer: ActiveCustomerType;
}

export const CustomerForm: React.FC<Props> = ({ initialCustomer }) => {
    const { t } = useTranslation('customer');
    const [view, setView] = useState<'details' | 'password'>('details');
    const handleView = (view: 'details' | 'password') => setView(view);

    return (
        <Stack w100 gap="3.5rem" column>
            <Stack w100 column gap="1.5rem">
                <TP size="2.5rem" weight={600}>
                    {t('accountPage.title')}
                </TP>
                <Stack gap="0.5rem">
                    <StyledButton active={view === 'details'} onClick={() => handleView('details')}>
                        {t('accountPage.detailsForm.title')}
                    </StyledButton>
                    <StyledButton active={view === 'password'} onClick={() => handleView('password')}>
                        {t('accountPage.passwordForm.title')}
                    </StyledButton>
                </Stack>
            </Stack>
            <AnimatePresence>
                {view === 'details' ? (
                    <CustomerDetailsForm initialCustomer={initialCustomer} />
                ) : (
                    <CustomerResetPasswordForm />
                )}
            </AnimatePresence>
        </Stack>
    );
};
