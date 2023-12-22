import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { OrderAddressType } from '@/src/graphql/selectors';
import React from 'react';

export const OrderAddress: React.FC<{ address?: OrderAddressType }> = ({ address }) => {
    if (!address) return null;
    return (
        <Stack column>
            <TP size="1.5rem" weight={500}>
                {address.fullName}
            </TP>
            <Stack gap="0.5rem">
                <TP>{address.streetLine1}</TP>
                <TP>{address.streetLine2}</TP>
            </Stack>
            <Stack gap="0.5rem">
                <TP>{address.city}</TP>
                <TP>{address.postalCode}</TP>
            </Stack>
        </Stack>
    );
};
