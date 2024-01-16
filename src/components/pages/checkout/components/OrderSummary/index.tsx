import { Stack } from '@/src/components/atoms/Stack';
import { Divider } from '@/src/components/atoms/Divider';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Line } from './Line';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFormatter';
import { CurrencyCode } from '@/src/zeus';
import { DiscountForm } from '@/src/components/molecules/DiscountForm';
import styled from '@emotion/styled';
import { useCheckout } from '@/src/state/checkout';
import { Discounts } from '@/src/components/molecules/Discounts';
interface OrderSummaryProps {
    shipping?: React.ReactNode;
    footer?: React.ReactNode;
}

export const OrderSummary: React.FC<PropsWithChildren<OrderSummaryProps>> = ({ footer, shipping }) => {
    const { activeOrder, applyCouponCode, removeCouponCode } = useCheckout();
    const { t } = useTranslation('checkout');
    // const { asPath } = useRouter();
    // const step = asPath.includes('payment') ? 'payment' : 'shipping';
    const currencyCode = activeOrder?.currencyCode ?? CurrencyCode.USD;

    // it is about hydration of discount form in checkout form
    const [jsEnabled, setJsEnabled] = useState(false);
    useEffect(() => {
        setJsEnabled(true);
    }, []);

    return (
        <SummaryContainer isForm={!!shipping}>
            <SummaryContent w100 column gap="2.5rem">
                <Stack w100 column gap="2.5rem">
                    {/* <CheckoutStatus step={step} /> */}
                    <TH2 size="3rem" weight={500}>
                        {t('orderSummary.title')}
                    </TH2>
                    <Stack column>
                        {activeOrder?.lines.map(line => (
                            <Line currencyCode={currencyCode} isForm={!!shipping} key={line.id} line={line} />
                        ))}
                        <Stack column gap="2.5rem">
                            <Stack justifyBetween>
                                <TP>{t('orderSummary.subtotal')}</TP>
                                <TP>{priceFormatter(activeOrder?.subTotalWithTax ?? 0, currencyCode)}</TP>
                            </Stack>
                            <Stack justifyBetween>
                                <TP>{t('orderSummary.shipping')}</TP>
                                <TP>{priceFormatter(activeOrder?.shippingWithTax ?? 0, currencyCode)}</TP>
                            </Stack>
                            {!!shipping && jsEnabled && (
                                <Stack w100 column gap="2.5rem">
                                    <Discounts
                                        discounts={activeOrder?.discounts}
                                        currencyCode={currencyCode}
                                        removeCouponCode={removeCouponCode}
                                    />
                                    <Stack w100>
                                        <DiscountForm applyCouponCode={applyCouponCode} />
                                    </Stack>
                                </Stack>
                            )}
                            {shipping}
                            <Divider />
                            <Stack justifyBetween>
                                <TP size="1.75rem" weight={600}>
                                    {t('orderSummary.total')}
                                </TP>
                                <TP size="1.75rem" weight={600}>
                                    {priceFormatter(activeOrder?.totalWithTax ?? 0, currencyCode)}
                                </TP>
                            </Stack>
                            {footer}
                        </Stack>
                    </Stack>
                </Stack>
            </SummaryContent>
        </SummaryContainer>
    );
};

const SummaryContainer = styled(Stack)<{ isForm?: boolean }>`
    max-width: 100%;
    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
        min-width: 52rem;
        max-width: 52rem;
    }

    width: ${({ isForm }) => (isForm ? 'auto' : '100%')};
    position: ${({ isForm }) => (isForm ? 'sticky' : 'relative')};
    top: ${({ isForm }) => (isForm ? '1.5rem' : '0')};
    border: 1px solid ${p => p.theme.gray(100)};
    padding: 3.25rem;
    height: fit-content;

    @media (max-width: 1024px) {
        width: 100%;
        position: relative;
        top: 0;
    }
`;

const SummaryContent = styled(Stack)``;
