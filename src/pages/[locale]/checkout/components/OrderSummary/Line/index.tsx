import React from 'react';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms/Stack';
import { TP, TypoGraphy } from '@/src/components/atoms/TypoGraphy';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { Divider } from '@/src/components/atoms/Divider';
import { useCart } from '@/src/state/cart';
import { priceFormatter } from '@/src/util/priceFomatter';
import { useTranslation } from 'next-i18next';
import { Minus, Plus } from 'lucide-react';
export const Line: React.FC<ActiveOrderType['lines'][number]> = ({
    id,
    productVariant,
    quantity,
    featuredAsset,
    linePriceWithTax,
    discountedLinePriceWithTax,
}) => {
    const { t } = useTranslation('checkout');
    const { setItemQuantityInCart } = useCart();
    console.log(linePriceWithTax, discountedLinePriceWithTax);

    const isPriceDiscounted = linePriceWithTax !== discountedLinePriceWithTax;
    const isDefaultVariant = productVariant.name.includes(productVariant.product.name);
    return (
        <Stack column style={{ paddingBottom: '2rem' }}>
            <Stack justifyBetween>
                <Stack gap="1.75rem" itemsCenter>
                    <ProductImage src={featuredAsset?.preview} size="thumbnail" />
                    <Stack column gap="0.75rem">
                        <Stack gap="1.25rem">
                            <TypoGraphy size="1.75rem" weight={500}>
                                {!isDefaultVariant
                                    ? `${productVariant.product.name} ${productVariant.name}`
                                    : productVariant.name}
                            </TypoGraphy>
                        </Stack>
                        <Stack column gap="0.25rem">
                            <TypoGraphy size="1rem" weight={500}>
                                {t('orderSummary.quantity')}
                            </TypoGraphy>
                            <OrderQuantityCounter v={quantity} onChange={q => setItemQuantityInCart(id, q)} />
                        </Stack>
                    </Stack>
                </Stack>
                <Stack itemsStart justifyEnd gap="2rem">
                    {!isPriceDiscounted ? (
                        <TP>{priceFormatter(linePriceWithTax)}</TP>
                    ) : (
                        <Stack justifyEnd gap="0.5rem">
                            <TP style={{ textDecoration: 'line-through' }}>{priceFormatter(linePriceWithTax)}</TP>
                            <TP style={{ color: 'red' }}>{priceFormatter(discountedLinePriceWithTax)}</TP>
                        </Stack>
                    )}
                </Stack>
            </Stack>

            <Divider style={{ marginTop: '2rem' }} />
        </Stack>
    );
};

export const OrderQuantityCounter = ({ onChange, v }: { onChange: (v: number) => void; v: number }) => {
    return (
        <Main gap="0.75rem" itemsCenter>
            <IconButton>
                <Minus onClick={() => onChange(v - 1)} />
            </IconButton>
            <span>{v}</span>
            <IconButton>
                <Plus onClick={() => onChange(v + 1)} />
            </IconButton>
        </Main>
    );
};

const Main = styled(Stack)`
    border: 1px solid ${p => p.theme.gray(100)};
    color: ${p => p.theme.gray(900)};
    align-self: flex-start;
    width: auto;
    font-size: 1.4rem;
    font-weight: 600;
`;

const IconButton = styled.button<{ isActive?: boolean }>`
    color: ${p => p.theme.gray(900)};
    border: 0;
    border-radius: 100%;
    font-weight: 600;
    outline: 0;
    width: 2.8rem;
    height: 2.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    svg {
        width: 1.4rem;
        height: 1.4rem;
    }
    :hover {
        box-shadow: none;
    }
`;
