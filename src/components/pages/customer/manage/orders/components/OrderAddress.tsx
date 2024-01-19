import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { OrderAddressType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import React from 'react';

interface OrderAddressProps {
    address?: OrderAddressType;
    label?: string;
    icon?: React.ReactNode;
}

export const OrderAddress: React.FC<OrderAddressProps> = ({ address, label, icon }) => {
    if (!address) return null;
    return (
        <NoteCard>
            <Stack gap="0.25rem" itemsCenter>
                {icon}
                <TP size="1.25rem" weight={500}>
                    {label}
                </TP>
            </Stack>
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
        </NoteCard>
    );
};

const NoteCard = styled(Stack)`
    background-color: ${p => p.theme.noteCard};
    box-shadow: 0 0.2rem 0.5rem 0.1rem ${p => p.theme.shadow};
    padding: 2rem 1.5rem 4rem 1.5rem;
    width: 100%;
    box-sizing: border-box;
    max-width: 25rem;
`;
