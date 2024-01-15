import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { DiscountForm } from '@/src/components/molecules/DiscountForm';
import { Discounts } from '@/src/components/molecules/Discounts';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import { useCart } from '@/src/state/cart';
import { priceFormatter } from '@/src/util/priceFormatter';
import { CurrencyCode } from '@/src/zeus';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

interface Props {
    activeOrder?: ActiveOrderType;
    currencyCode: CurrencyCode;
    discountsSum: number;
}

export const CartFooter: React.FC<Props> = ({ activeOrder, currencyCode, discountsSum }) => {
    const { t } = useTranslation('common');
    const { close, applyCouponCode, removeCouponCode } = useCart();
    const [loading, setLoading] = useState(false);
    const push = usePush();
    return (
        <CartFooterWrapper column justifyBetween gap="2.5rem" haveItems={!!activeOrder?.totalQuantity}>
            {activeOrder && activeOrder?.totalQuantity > 0 ? (
                <>
                    <Stack w100 justifyBetween>
                        <Stack column w100 gap="1.5rem" style={{ padding: '1rem' }}>
                            <Stack column>
                                <Stack justifyBetween>
                                    <TP>{t('subtotal')}</TP>
                                    <TP>
                                        {priceFormatter(
                                            (activeOrder?.subTotalWithTax || 0) + discountsSum,
                                            currencyCode,
                                        )}
                                    </TP>
                                </Stack>
                                {discountsSum > 0 ? (
                                    <Stack justifyBetween>
                                        <TP>{t('discount')}</TP>
                                        <TP>-{priceFormatter(discountsSum, currencyCode)}</TP>
                                    </Stack>
                                ) : null}
                                <Stack justifyBetween>
                                    <TP weight={600}>{t('total')}</TP>
                                    <TP weight={600}>
                                        {priceFormatter(activeOrder?.subTotalWithTax || 0, currencyCode)}
                                    </TP>
                                </Stack>
                            </Stack>
                        </Stack>
                        <Stack column w100 gap="1rem" style={{ padding: '1rem' }}>
                            <DiscountForm applyCouponCode={applyCouponCode} />
                            <Discounts
                                discounts={activeOrder.discounts}
                                removeCouponCode={removeCouponCode}
                                currencyCode={currencyCode}
                            />
                        </Stack>
                    </Stack>
                    <StyledButton
                        dark
                        loading={loading}
                        onClick={() => {
                            setLoading(true);
                            push('/checkout');
                        }}>
                        {t('proceed-to-checkout')}
                    </StyledButton>
                </>
            ) : (
                <StyledButton onClick={close}>{t('continue-shopping')}</StyledButton>
            )}
        </CartFooterWrapper>
    );
};

const CartFooterWrapper = styled(Stack)<{ haveItems?: boolean }>`
    padding: 1.5rem 2rem;
    border-top: 1px solid ${p => p.theme.gray(100)};
    height: ${p => (p.haveItems ? '30%' : 'fit-content')};
`;

const StyledButton = styled(Button)<{ dark?: boolean }>`
    appearance: none;
    border: none;
    background: ${p => (p.dark ? p.theme.gray(1000) : p.theme.gray(0))};

    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 1.6rem 0.8rem;

    color: ${p => (p.dark ? p.theme.gray(0) : p.theme.gray(1000))};
    text-align: center;
    text-transform: uppercase;
    font-weight: 500;
    font-size: 1.6rem;
    border: 1px solid ${p => p.theme.gray(1000)};
    border-radius: ${p => p.theme.borderRadius};
`;
