import { Stack } from '@/src/components/atoms/Stack';
import { Divider } from '@/src/components/atoms/Divider';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import React, { Fragment } from 'react';
import { CheckoutStatus } from '../CheckoutStatus';
import { Line } from './Line';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';
import { DiscountForm } from '@/src/components/molecules/DiscountForm';
import styled from '@emotion/styled';
import { YAMLProductsType } from '@/src/graphql/selectors';
import { YMALCarousel } from './YMAL';
import { useCheckout } from '@/src/state/checkout';
import { Discounts } from '@/src/components/molecules/Discounts';
import { LogoAexol } from '@/src/assets';

interface OrderSummaryProps {
    isForm?: boolean;
    YMALProducts?: YAMLProductsType[];
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ isForm, YMALProducts }) => {
    const { activeOrder, applyCouponCode, removeCouponCode } = useCheckout();

    const { t } = useTranslation('checkout');
    const { t: tInfo } = useTranslation('common');
    const { asPath } = useRouter();
    const step = asPath.includes('payment') ? 'payment' : 'shipping';
    const currencyCode = activeOrder?.currencyCode ?? CurrencyCode.USD;

    return (
        <SummaryContainer>
            <SummaryContent w100 column gap="2.5rem">
                <Stack itemsCenter w100 gap="3.5rem">
                    <LogoAexol width={48} height={48} />
                    <TH2 size="2.5rem" weight={500}>
                        {tInfo('shop')}
                    </TH2>
                </Stack>
                <Stack w100 column gap="2.5rem">
                    <CheckoutStatus step={step} />
                    <TH2 size="3rem" weight={500}>
                        {t('orderSummary.title')}
                    </TH2>
                    <Stack column>
                        {activeOrder?.lines.map(line => (
                            <Line currencyCode={currencyCode} isForm={isForm} key={line.id} line={line} />
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
                            {isForm && (
                                <Fragment>
                                    <Divider />
                                    <Stack column gap="2.5rem">
                                        <Discounts
                                            discounts={activeOrder?.discounts}
                                            currencyCode={currencyCode}
                                            removeCouponCode={removeCouponCode}
                                        />
                                        <Stack style={{ maxWidth: '25.6rem' }}>
                                            <DiscountForm applyCouponCode={applyCouponCode} />
                                        </Stack>
                                    </Stack>
                                </Fragment>
                            )}
                            <Divider />
                            <Stack justifyBetween>
                                <TP size="1.75rem" weight={600}>
                                    {t('orderSummary.total')}
                                </TP>
                                <TP size="1.75rem" weight={600}>
                                    {priceFormatter(activeOrder?.totalWithTax ?? 0, currencyCode)}
                                </TP>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Divider />
                    {YMALProducts && YMALProducts.length > 0 ? (
                        <YMALCarousel currencyCode={currencyCode} YMALProducts={YMALProducts} />
                    ) : null}
                </Stack>
            </SummaryContent>
        </SummaryContainer>
    );
};

const SummaryContainer = styled(Stack)<{ isForm?: boolean }>`
    width: ${({ isForm }) => (isForm ? 'calc(50% - 2.5rem)' : '100%')};
    position: sticky;
    top: 9.5rem;
    height: fit-content;

    @media (max-width: 1024px) {
        width: 100%;
        position: relative;
        top: 0;
    }
`;

const SummaryContent = styled(Stack)``;
