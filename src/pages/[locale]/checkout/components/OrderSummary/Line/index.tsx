import React from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { TP, TypoGraphy } from '@/src/components/atoms/TypoGraphy';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { ActiveOrderType, OrderType } from '@/src/graphql/selectors';
import { Divider } from '@/src/components/atoms/Divider';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';

export const Line: React.FC<{
    line: ActiveOrderType['lines'][number] | OrderType['lines'][number];
    currencyCode?: CurrencyCode;
    hideQuantity?: boolean;
}> = ({
    line: { productVariant, quantity, featuredAsset, unitPriceWithTax, linePriceWithTax, discountedLinePriceWithTax },
    currencyCode = CurrencyCode.USD,
}) => {
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
                                <TypoGraphy size="1.25rem" weight={400}>
                                    {quantity} x {priceFormatter(unitPriceWithTax, currencyCode)}
                                </TypoGraphy>
                            </Stack>
                        </Stack>
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
