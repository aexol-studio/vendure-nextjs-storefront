import { Stack } from '@/src/components/atoms/Stack';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import React from 'react';
import { CheckoutStatus } from '../ui/CheckoutStatus';
import { useCart } from '@/src/state/cart';
import { Line } from './Line';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export const OrderSummary = () => {
    const { t } = useTranslation('checkout');
    const { asPath } = useRouter();
    const { cart } = useCart();
    const step = asPath.includes('payment') ? 'payment' : 'shipping';

    return (
        <Stack column>
            <CheckoutStatus step={step} />
            <TH2 size="3rem" weight={500}>
                {t('orderSummary.title')}
            </TH2>
            <Stack column>
                {cart?.lines.map((line, i) => <Line currencyCode={cart.currencyCode} key={i} lines={line} />)}
                <Stack column>
                    <Stack justifyBetween>
                        <TP>{t('orderSummary.subtotal')}</TP>
                        <TP>{cart?.subTotalWithTax}</TP>
                    </Stack>
                    <Stack justifyBetween>
                        <TP>{t('orderSummary.shipping')}</TP>
                        <TP>{cart?.shipping}</TP>
                    </Stack>
                </Stack>
                <Stack justifyBetween>
                    <TP>{t('orderSummary.total')}</TP>
                    <TP>{cart?.totalWithTax}</TP>
                </Stack>
            </Stack>
        </Stack>
    );
};
