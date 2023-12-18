import { Stack } from '@/src/components/atoms/Stack';
import { Divider } from '@/src/components/atoms/Divider';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import React, { Fragment } from 'react';
import { CheckoutStatus } from '../CheckoutStatus';
import { useCart } from '@/src/state/cart';
import { Line } from './Line';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';
import { DiscountForm } from '@/src/components/molecules/DiscountForm';
import { X } from 'lucide-react';
import styled from '@emotion/styled';
import { YAMLProductsType } from '@/src/graphql/selectors';
import { YMALCarousel } from './YMAL';

interface OrderSummaryProps {
    isForm?: boolean;
    YMALProducts?: YAMLProductsType[];
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ isForm, YMALProducts }) => {
    const { t } = useTranslation('checkout');
    const { asPath } = useRouter();
    const { cart, removeCouponCode } = useCart();
    const step = asPath.includes('payment') ? 'payment' : 'shipping';
    const currencyCode = cart?.currencyCode ?? CurrencyCode.USD;

    return (
        <SummaryContainer style={{ maxWidth: 'calc(50% - 10rem)' }}>
            <SummaryContent w100 column gap="2rem">
                <CheckoutStatus step={step} />
                <TH2 size="3rem" weight={500}>
                    {t('orderSummary.title')}
                </TH2>
                <Stack column>
                    {cart?.lines.map(line => (
                        <Line currencyCode={currencyCode} isForm={isForm} key={line.id} line={line} />
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
                        {isForm && (
                            <Fragment>
                                <Divider />
                                <Stack column gap="2.5rem">
                                    {cart?.discounts.map(d => (
                                        <Stack key={d.description} justifyBetween>
                                            <Stack itemsCenter gap="1.25rem">
                                                <Remove onClick={() => removeCouponCode(d.description)}>
                                                    <X size={16} />
                                                </Remove>
                                                <TP>
                                                    {t('orderSummary.couponCode')} {d.description}
                                                </TP>
                                            </Stack>
                                            <TP>{priceFormatter(d.amountWithTax, currencyCode)}</TP>
                                        </Stack>
                                    ))}
                                    <Stack style={{ maxWidth: '25.6rem' }}>
                                        <DiscountForm />
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
                                {priceFormatter(cart?.totalWithTax ?? 0, currencyCode)}
                            </TP>
                        </Stack>
                    </Stack>
                </Stack>
                <Divider />
                {YMALProducts && YMALProducts.length > 0 ? (
                    <YMALCarousel currencyCode={currencyCode} YMALProducts={YMALProducts} />
                ) : null}
            </SummaryContent>
        </SummaryContainer>
    );
};

const SummaryContainer = styled(Stack)`
    position: sticky;
    top: 9.5rem;
    height: fit-content;
`;
const SummaryContent = styled(Stack)`
    padding: 1.5rem 1.25rem;
`;

const Remove = styled.button`
    appearance: none;
    border: none;
    background: transparent;

    display: flex;
    align-items: center;
    width: fit-content;

    gap: 0.4rem;
`;
