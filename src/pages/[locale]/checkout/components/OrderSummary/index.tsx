import { Stack } from '@/src/components/atoms/Stack';
import { Divider } from '@/src/components/atoms/Divider';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import React, { useMemo } from 'react';
import { CheckoutStatus } from '../CheckoutStatus';
import { useCart } from '@/src/state/cart';
import { Line } from './Line';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';

export const OrderSummary: React.FC<{ hideQuantity?: boolean }> = ({ hideQuantity }) => {
    const { t } = useTranslation('checkout');
    const { asPath } = useRouter();
    const { cart } = useCart();
    const step = asPath.includes('payment') ? 'payment' : 'shipping';
    const currencyCode = cart?.currencyCode ?? CurrencyCode.USD;

    const total = useMemo(() => {
        if (cart?.totalWithTax && cart?.discounts.length > 0) {
            const discounts = cart?.discounts?.reduce((acc, discount) => acc - discount.amountWithTax, 0) ?? 0;
            return priceFormatter(cart?.totalWithTax - discounts, currencyCode);
        } else return priceFormatter(cart?.totalWithTax || 0, currencyCode);
    }, [cart]);

    return (
        <Stack style={{ width: '100%', position: 'sticky', top: '9.6rem', height: 'fit-content' }}>
            <Stack column gap="2rem" style={{ paddingInline: '1rem' }}>
                <CheckoutStatus step={step} />
                <TH2 size="3rem" weight={500}>
                    {t('orderSummary.title')}
                </TH2>
                <Stack column>
                    {cart?.lines.map(line => (
                        <Line hideQuantity={hideQuantity} currencyCode={currencyCode} key={line.id} line={line} />
                    ))}
                    <Stack column gap="2.5rem">
                        <Stack justifyBetween>
                            <TP>{t('orderSummary.subtotal')}</TP>
                            <TP>{priceFormatter(cart?.subTotalWithTax ?? 0, currencyCode)}</TP>
                        </Stack>
                        <Stack justifyBetween>
                            <TP>{t('orderSummary.shipping')}</TP>
                            <TP>{priceFormatter(cart?.shippingWithTax ?? 0, currencyCode)}</TP>
                        </Stack>
                        {cart?.discounts.map(d => (
                            <Stack key={d.description} justifyBetween>
                                <TP>{d.description}</TP>
                                <TP>{priceFormatter(d.amountWithTax, currencyCode)}</TP>
                            </Stack>
                        ))}
                        <Divider />
                        <Stack justifyBetween>
                            <TP size="1.75rem" weight={600}>
                                {t('orderSummary.total')}
                            </TP>
                            <TP size="1.75rem" weight={600}>
                                {/* {priceFormatter(cart?.totalWithTax ?? 0, currencyCode)} */}
                                {total}
                            </TP>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    );
};
