import { Stack } from '@/src/components/atoms/Stack';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { ActiveOrderType, ShippingMethodType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';
import { FormError } from '@/src/components/forms/atoms/FormError';

interface Props {
    selected?: string;
    onChange: (id: string) => void;
    error?: string;
    shippingMethods: ShippingMethodType[];
    currencyCode?: ActiveOrderType['currencyCode'];
    required?: boolean;
}

export const DeliveryMethod: React.FC<Props> = ({
    selected,
    onChange,
    error,
    shippingMethods,
    currencyCode = CurrencyCode.USD,
    required,
}) => {
    const { t } = useTranslation('checkout');
    return (
        <Stack w100 column>
            <Stack column gap="0.125rem" itemsStart>
                <TH2 size="2rem" weight={500}>
                    {t('deliveryMethod.title')}
                </TH2>
                {required && (
                    <Required weight={600} size="1rem">
                        {t('deliveryMethod.required')}
                    </Required>
                )}
            </Stack>

            <Stack column>
                <Wrapper gap="2rem">
                    {shippingMethods?.map(({ id, name, description, price }) => (
                        <Box w100 selected={selected === id} key={id} column onClick={() => onChange(id)}>
                            <TP>{name}</TP>
                            <StyledDescription dangerouslySetInnerHTML={{ __html: description }} />
                            <TP>{priceFormatter(price, currencyCode)}</TP>
                        </Box>
                    ))}
                </Wrapper>{' '}
                <FormError
                    style={{ margin: 0 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: error ? 1 : 0 }}
                    transition={{ duration: 0.2 }}>
                    {error}
                </FormError>
            </Stack>
        </Stack>
    );
};

const Wrapper = styled(Stack)`
    margin: 1.6rem 0;
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

const Required = styled(TP)`
    color: red;
`;
