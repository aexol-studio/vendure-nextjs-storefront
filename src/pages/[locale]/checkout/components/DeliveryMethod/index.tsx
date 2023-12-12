import { Stack } from '@/src/components/atoms/Stack';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { ActiveOrderType, ShippingMethodType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';
import { FormError } from '../ui/FormError';

interface Props {
    selected?: string;
    onChange: (id: string) => void;
    error?: string;
    shippingMethods: ShippingMethodType[];
    currencyCode?: ActiveOrderType['currencyCode'];
}

export const DeliveryMethod: React.FC<Props> = ({
    selected,
    onChange,
    error,
    shippingMethods,
    currencyCode = CurrencyCode.USD,
}) => {
    const { t } = useTranslation('checkout');
    return (
        <Stack column>
            <TH2>{t('deliveryMethod.title')}</TH2>
            <FormError
                style={{ margin: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: error ? 1 : 0 }}
                transition={{ duration: 0.2 }}>
                {error}
            </FormError>
            <Wrapper gap="2rem">
                {shippingMethods?.map(({ id, name, description, price }) => {
                    return (
                        <Box selected={selected === id} key={id} column onClick={() => onChange(id)}>
                            <TP>{name}</TP>
                            <StyledDescription dangerouslySetInnerHTML={{ __html: description }} />
                            <TP>{priceFormatter(price, currencyCode)}</TP>
                        </Box>
                    );
                })}
            </Wrapper>
        </Stack>
    );
};

const Wrapper = styled(Stack)`
    margin: 0.8rem 0 3.2rem 0;
`;

const Box = styled(Stack)<{ selected: boolean }>`
    cursor: pointer;
    padding: 2rem;
    border: 1px solid ${p => (p.selected ? p.theme.gray(800) : p.theme.gray(200))};
    border-radius: 8px;

    &:hover {
        border: 1px solid ${p => p.theme.gray(400)};
    }
`;

const StyledDescription = styled.div`
    color: ${p => p.theme.gray(1000)};
    & > p {
        font-size: 1rem;
    }
`;
