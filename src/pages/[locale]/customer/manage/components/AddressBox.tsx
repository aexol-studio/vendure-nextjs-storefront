import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { ActiveAddressType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { CreditCard, Pen, Truck } from 'lucide-react';
import React from 'react';

interface Props {
    address: ActiveAddressType;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const AddressBox: React.FC<Props> = ({ address, onEdit, onDelete }) => {
    return (
        <CustomerAddress column>
            <DefaultMethodsWrapper gap="1rem" justifyEnd>
                <DefaultBilling active={address.defaultBillingAddress} />
                <DefaultShipping active={address.defaultShippingAddress} />
            </DefaultMethodsWrapper>
            <TP>{address.fullName}</TP>
            <TP>{address.company}</TP>
            <TP>{address.streetLine1}</TP>
            <TP>{address.streetLine2}</TP>
            <TP>{address.city}</TP>
            <TP>{address.province}</TP>
            <TP>{address.postalCode}</TP>
            <TP>{address.country.code}</TP>
            <TP>{address.phoneNumber}</TP>
            {(onEdit || onDelete) && (
                <Wrapper itemsCenter gap="2.5rem">
                    {onEdit && (
                        <Option onClick={() => onEdit(address.id)}>
                            <TP>Edit</TP>
                            <Edit size={16} />
                        </Option>
                    )}
                    {onDelete && (
                        <Option onClick={() => onDelete(address.id)}>
                            <TP>Delete</TP>
                            <Edit size={16} />
                        </Option>
                    )}
                </Wrapper>
            )}
        </CustomerAddress>
    );
};

const DefaultMethodsWrapper = styled(Stack)``;

const DefaultBilling = styled(CreditCard)<{ active?: boolean }>`
    color: ${p => (p.active ? p.theme.success : p.theme.gray(1000))};
`;
const DefaultShipping = styled(Truck)<{ active?: boolean }>`
    color: ${p => (p.active ? p.theme.success : p.theme.gray(1000))};
`;

const Wrapper = styled(Stack)`
    margin-top: 1rem;
`;

const Option = styled.button`
    display: flex;
    align-items: center;
    gap: 1.25rem;

    background-color: transparent;
    border: none;
    cursor: pointer;

    color: ${p => p.theme.gray(1000)};
    border-radius: ${p => p.theme.borderRadius};
    border: 1px solid ${p => p.theme.gray(200)};
    padding: 0.5rem 1rem;
    background-color: ${p => p.theme.gray(100)};
`;

const Edit = styled(Pen)`
    cursor: pointer;
`;

const CustomerAddress = styled(Stack)`
    position: relative;
    width: fit-content;
    padding: 3rem 2.5rem;
    background-color: ${p => p.theme.gray(50)};
    border-radius: ${p => p.theme.borderRadius};
    box-shadow: 0 0 0.5rem ${p => p.theme.gray(200)};
`;
