import React from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { TP, TypoGraphy } from '@/src/components/atoms/TypoGraphy';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { ActiveOrderType, OrderType } from '@/src/graphql/selectors';
import { Divider } from '@/src/components/atoms/Divider';
import { CurrencyCode } from '@/src/zeus';
import styled from '@emotion/styled';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { Price } from '@/src/components/atoms/Price';
import { useCheckout } from '@/src/state/checkout';

interface LineProps {
    line: ActiveOrderType['lines'][number] | OrderType['lines'][number];
    isForm?: boolean;
    currencyCode?: CurrencyCode;
}

export const Line: React.FC<LineProps> = ({
    isForm,
    line: {
        id,
        productVariant,
        quantity,
        featuredAsset,
        unitPriceWithTax,
        linePriceWithTax,
        discountedLinePriceWithTax,
    },
    currencyCode = CurrencyCode.USD,
}) => {
    const { removeFromCheckout, changeQuantity } = useCheckout();
    const { t } = useTranslation('checkout');
    const optionInName = productVariant.name.replace(productVariant.product.name, '') !== '';
    const isPriceDiscounted = linePriceWithTax !== discountedLinePriceWithTax;
    return (
        <Stack column style={{ paddingBottom: '2rem' }}>
            <Stack justifyBetween>
                <Stack gap="1.75rem" itemsStart>
                    <ProductImage
                        src={featuredAsset?.preview}
                        size="thumbnail"
                        alt={productVariant.product.name}
                        title={productVariant.product.name}
                    />
                    <Stack column gap="0.75rem" justifyBetween style={{ height: '100%' }}>
                        <Stack gap="1.25rem">
                            <Stack column gap="0.5rem">
                                <TypoGraphy size="1.5rem" weight={500} noWrap>
                                    {productVariant.product.name}
                                </TypoGraphy>
                                {optionInName && (
                                    <TypoGraphy size="1.25rem" weight={400} capitalize>
                                        {productVariant.name.replace(productVariant.product.name, '')}
                                    </TypoGraphy>
                                )}
                                <TypoGraphy size="1.25rem" weight={600}>
                                    {t('orderSummary.quantity')} {quantity}
                                </TypoGraphy>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
                <Stack column justifyBetween itemsEnd>
                    <Stack gap="2rem">
                        {isPriceDiscounted ? (
                            <Price
                                price={discountedLinePriceWithTax}
                                // beforePrice={productVariant.customFields?.beforePrice}
                                currencyCode={currencyCode}
                                quantity={1}
                            />
                        ) : (
                            <Price
                                price={unitPriceWithTax}
                                // beforePrice={productVariant.customFields?.beforePrice}
                                currencyCode={currencyCode}
                                quantity={1}
                            />
                        )}
                    </Stack>
                    {isForm && (
                        <>
                            <Stack gap="1rem" itemsCenter>
                                {quantity > 1 && (
                                    <Action onClick={() => changeQuantity(id, quantity - 1)}>
                                        <Minus size={16} />
                                    </Action>
                                )}
                                <Action onClick={() => changeQuantity(id, quantity + 1)}>
                                    <Plus size={16} />
                                </Action>
                            </Stack>
                            <Action onClick={() => removeFromCheckout(id)}>
                                <TP size="1.25rem">{t('orderSummary.remove')}</TP>
                                <Trash2 size={16} />
                            </Action>
                        </>
                    )}
                </Stack>
            </Stack>
            <Divider style={{ marginTop: '2rem' }} />
        </Stack>
    );
};

const Action = styled.button`
    appearance: none;
    border: none;
    background: transparent;

    display: flex;
    align-items: center;
    width: fit-content;

    gap: 0.5rem;
`;
