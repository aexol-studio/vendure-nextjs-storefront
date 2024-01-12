import { Stack, TP } from '@/src/components';
import { User, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

interface OrderCustomerProps {
    customer?: {
        firstName?: string;
        lastName?: string;
        emailAddress?: string;
        phoneNumber?: string;
    };
}

export const OrderCustomer: React.FC<OrderCustomerProps> = ({ customer }) => {
    const { t } = useTranslation('customer');

    return (
        <Stack column gap="2rem">
            {(customer?.firstName || customer?.lastName) && (
                <Stack column gap="0.5rem">
                    <Stack gap="0.5rem" itemsCenter>
                        <User size={'1.6rem'} />
                        <TP size="1.25rem" weight={500}>
                            {t('orderPage.customerName')}
                        </TP>
                    </Stack>
                    <TP>
                        {customer?.firstName} {customer?.lastName}
                    </TP>
                </Stack>
            )}
            <Stack gap="2.5rem">
                <Stack column gap="0.5rem">
                    <Stack gap="0.5rem" itemsCenter>
                        <Mail size={'1.6rem'} />
                        <TP size="1.25rem" weight={500}>
                            {t('orderPage.email')}
                        </TP>
                    </Stack>
                    <TP>{customer?.emailAddress}</TP>
                </Stack>
                {customer?.phoneNumber ? (
                    <Stack column gap="0.5rem">
                        <Stack gap="0.5rem" itemsCenter>
                            <Phone size={'1.6rem'} />
                            <TP size="1.25rem" weight={500}>
                                {t('orderPage.phone')}
                            </TP>
                        </Stack>
                        <TP>{customer?.phoneNumber}</TP>
                    </Stack>
                ) : null}
            </Stack>
        </Stack>
    );
};
