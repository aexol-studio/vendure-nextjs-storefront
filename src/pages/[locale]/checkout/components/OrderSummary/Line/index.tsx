import React from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { QuantityCounter } from '@/src/components/molecules/QuantityCounter';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { useCart } from '@/src/state/cart';
import { priceFormatter } from '@/src/util/priceFomatter';
import { useTranslation } from 'next-i18next';
import { CurrencyCode } from '@/src/zeus';

export const Line: React.FC<{ lines: ActiveOrderType['lines'][number]; currencyCode?: CurrencyCode }> = ({
    lines: { id, productVariant, quantity, featuredAsset },
    currencyCode = CurrencyCode.USD,
}) => {
    const { t } = useTranslation('checkout');
    const { setItemQuantityInCart, removeFromCart } = useCart();

    return (
        <Stack column>
            <Stack justifyBetween>
                <Stack>
                    <img src={featuredAsset?.preview} width={100} height={100} />
                </Stack>
                <Stack column>
                    <TP>
                        {productVariant.product.name} {productVariant.name}
                    </TP>
                </Stack>
                <TP>{priceFormatter(productVariant.price, currencyCode)}</TP>
            </Stack>
            <Stack justifyBetween>
                <Stack>
                    <TP>{t('orderSummary.quantity')}</TP>
                    <QuantityCounter v={quantity} onChange={q => setItemQuantityInCart(id, q)} />
                </Stack>
                <Button onClick={() => removeFromCart(id)}>{t('orderSummary.remove')}</Button>
            </Stack>
        </Stack>
    );
};
