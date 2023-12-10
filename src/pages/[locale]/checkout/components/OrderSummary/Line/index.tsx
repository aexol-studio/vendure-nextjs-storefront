import React from 'react';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms/Stack';
import { TP, TypoGraphy } from '@/src/components/atoms/TypoGraphy';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { Divider } from '@/src/components/atoms/Divider';
import { useCart } from '@/src/state/cart';
import { priceFormatter } from '@/src/util/priceFomatter';
import { Minus, Plus } from 'lucide-react';
import { CurrencyCode } from '@/src/zeus';

export const Line: React.FC<{
    line: ActiveOrderType['lines'][number];
    currencyCode?: CurrencyCode;
    hideQuantity?: boolean;
}> = ({
    line: { id, productVariant, quantity, featuredAsset, linePriceWithTax, discountedLinePriceWithTax },
    currencyCode = CurrencyCode.USD,
    hideQuantity,
}) => {
    const { setItemQuantityInCart } = useCart();
    const optionInName = productVariant.name.replace(productVariant.product.name, '') !== '';
    const isPriceDiscounted = linePriceWithTax !== discountedLinePriceWithTax;
    return (
        <Stack column style={{ paddingBottom: '2rem' }}>
            <Stack justifyBetween>
                <Stack gap="1.75rem" itemsStart>
                    <ProductImage src={featuredAsset?.preview} size="thumbnail" />
                    <Stack column gap="0.75rem" justifyBetween style={{ height: '100%' }}>
                        <Stack gap="1.25rem">
                            <Stack column gap="0.5rem">
                                <TypoGraphy size="1.5rem" weight={500} style={{ whiteSpace: 'nowrap' }}>
                                    {productVariant.product.name}
                                </TypoGraphy>
                                {optionInName && (
                                    <TypoGraphy size="1.25rem" weight={400}>
                                        {productVariant.name.replace(productVariant.product.name, '')}
                                    </TypoGraphy>
                                )}
                            </Stack>
                        </Stack>
                        {!hideQuantity && (
                            <Stack column gap="0.25rem">
                                <OrderQuantityCounter v={quantity} onChange={q => setItemQuantityInCart(id, q)} />
                            </Stack>
                        )}
                    </Stack>
                </Stack>
                <Stack itemsStart justifyEnd gap="2rem">
                    {isPriceDiscounted ? (
                        <Stack justifyEnd gap="0.5rem">
                            <TP size="1.25rem" style={{ textDecoration: 'line-through', lineHeight: '2.4rem' }}>
                                {priceFormatter(linePriceWithTax, currencyCode)}
                            </TP>
                            <TP style={{ color: 'red' }}>{priceFormatter(discountedLinePriceWithTax, currencyCode)}</TP>
                        </Stack>
                    ) : (
                        <TP>{priceFormatter(linePriceWithTax, currencyCode)}</TP>
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
