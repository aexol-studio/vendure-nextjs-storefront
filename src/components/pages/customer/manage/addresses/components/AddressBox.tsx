import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { ActiveAddressType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { CreditCard, Factory, Pen, Trash2, Truck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from '@/src/components/molecules/Button';

interface Props {
    address: ActiveAddressType;
    selected?: boolean;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    deleting?: string;
}

export const AddressBox: React.FC<Props> = ({ address, selected, onEdit, onDelete, deleting }) => {
    const { t } = useTranslation('customer');
    const showProvince = address.city === address.province;
    return (
        <CustomerAddress itemsStart gap="1.5rem" selected={selected} column>
            <Stack w100 justifyBetween itemsStart>
                <Stack column gap="1rem">
                    <TP>{address.fullName}</TP>
                    {address.company && address.company !== '' && (
                        <Stack itemsCenter gap="0.5rem">
                            <Factory size="1.5rem" />
                            <TP size="1.5rem" style={{ lineHeight: '1.5rem' }}>
                                {address.company}
                            </TP>
                        </Stack>
                    )}
                    <TP>
                        {address.streetLine1} {address.streetLine2}
                    </TP>
                    <TP>
                        {address.city}, {showProvince ? address.province : undefined} {address.postalCode}
                    </TP>
                    <TP>{address.phoneNumber}</TP>
                </Stack>
                <Stack column itemsEnd gap="0.5rem">
                    {(onEdit || onDelete) && (
                        <DefaultMethodsWrapper gap="1rem" justifyEnd>
                            <DefaultBilling active={address.defaultBillingAddress} />
                            <DefaultShipping active={address.defaultShippingAddress} />
                        </DefaultMethodsWrapper>
                    )}
                    <TP>{address.country.code}</TP>
                </Stack>
            </Stack>
            {(onEdit || onDelete) && (
                <Wrapper w100 itemsCenter gap="2.5rem">
                    {onEdit && (
                        <Option onClick={() => onEdit(address.id)}>
                            <TP color="contrast" size="1.25rem">
                                {t('addressForm.edit')}
                            </TP>
                            <Edit size={'1.5rem'} />
                        </Option>
                    )}
                    {onDelete && (
                        <Option loading={deleting === address.id} onClick={() => onDelete(address.id)}>
                            <TP color="contrast" size="1.25rem">
                                {t('addressForm.delete')}
                            </TP>
                            <Delete size={'1.5rem'} />
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

    p {
        white-space: nowrap;
    }
`;

const Option = styled(Button)`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1.25rem;
`;

const Delete = styled(Trash2)`
    min-width: 1.5rem;
    cursor: pointer;
`;

const Edit = styled(Pen)`
    min-width: 1.5rem;
    cursor: pointer;
`;

const CustomerAddress = styled(Stack)<{ selected?: boolean }>`
    min-width: 42rem;
    position: relative;
    padding: 3rem 2.5rem;
    background-color: ${p => p.theme.gray(50)};
    border-radius: ${p => p.theme.borderRadius};
    box-shadow: 0 0 0.5rem ${({ theme }) => theme.shadow};

    outline: ${p => (p.selected ? `1px solid ${p.theme.accent(700)}` : `1px solid ${p.theme.gray(200)}`)};
    transition: outline 0.2s ease-in-out;
`;
