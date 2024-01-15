import React from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';

import { Divider } from '@/src/components/atoms/Divider';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { CheckCircle2, X } from 'lucide-react';
import { priceFormatter } from '@/src/util/priceFormatter';
import { CurrencyCode } from '@/src/zeus';
import { OrderStateType, OrderType } from '@/src/graphql/selectors';
import { Trans, useTranslation } from 'next-i18next';
import { Discounts } from '@/src/components/molecules/Discounts';
import { Price } from '@/src/components';
import styled from '@emotion/styled';

export const OrderConfirmation: React.FC<{ code: string; order?: OrderType }> = ({ code, order }) => {
    const { t } = useTranslation('checkout');

    const currencyCode = order?.currencyCode || CurrencyCode.USD;
    const discounts = order?.discounts?.reduce((acc, discount) => acc - discount.amountWithTax, 0) ?? 0;

    const orderState = order?.state as OrderStateType;
    //TODO: Add all possible payment states
    // const paymentState = order?.payments?.[0]?.state;

    return (
        <Wrapper column w100 gap="2.5rem">
            <Stack column gap="4rem">
                <Stack justifyBetween w100 gap="2rem">
                    <Stack w100 column gap="4rem">
                        <Stack itemsCenter gap="2rem">
                            {orderState === 'Cancelled' ? (
                                <X color="red" size={44} />
                            ) : (
                                <CheckCircle2 color="green" size={44} />
                            )}
                            <TH2>{t('orderSummary.title')}</TH2>
                        </Stack>
                        <TP size="2rem">
                            {orderState === 'Cancelled' ? (
                                <Trans
                                    values={{ code }}
                                    components={{ 1: <strong></strong> }}
                                    i18nKey="confirmation.orderCancelled"
                                    t={t}
                                />
                            ) : (
                                <Trans
                                    i18nKey="confirmation.orderReceived"
                                    t={t}
                                    values={{ code }}
                                    components={{ 1: <strong></strong> }}
                                />
                            )}
                        </TP>
                    </Stack>
                    {orderState !== 'Cancelled' && (
                        <Stack w100 column gap="1rem">
                            <Stack justifyBetween>
                                <TP>{t('orderSummary.subtotal')}</TP>
                                <TP weight={600}>{priceFormatter(order?.subTotalWithTax || 0, currencyCode)}</TP>
                            </Stack>
                            <Stack justifyBetween>
                                <TP>{t('orderSummary.discount')}</TP>
                                <TP weight={600}>{priceFormatter(discounts, currencyCode)}</TP>
                            </Stack>
                            <Stack justifyBetween>
                                <TP>{t('orderSummary.shipping')}</TP>
                                <TP weight={600}> {priceFormatter(order?.shippingWithTax || 0, currencyCode)}</TP>
                            </Stack>
                            {order?.discounts && order?.discounts.length > 0 ? <Divider /> : null}
                            <Discounts withLabel discounts={order?.discounts} currencyCode={currencyCode} />
                            <Divider />
                            <Stack justifyBetween>
                                <TP>{t('orderSummary.total')}</TP>
                                <TP weight={600}>
                                    {priceFormatter((order?.totalWithTax ?? 0) - discounts, currencyCode)}
                                </TP>
                            </Stack>
                        </Stack>
                    )}
                </Stack>
                <Divider marginBlock="4rem" />
                {order?.lines.map(line => {
                    const isDefaultVariant = line.productVariant.name.includes(line.productVariant.product.name);
                    return (
                        <Stack key={line.productVariant.name} column>
                            <Stack justifyBetween>
                                <Stack gap="3rem">
                                    <ProductImage
                                        src={line.featuredAsset?.preview}
                                        size="thumbnail-big"
                                        alt={line.productVariant.name}
                                        title={line.productVariant.name}
                                    />
                                    <Stack column>
                                        <TP size="2rem" weight={600} style={{ paddingBottom: '2rem' }}>
                                            {!isDefaultVariant
                                                ? `${line.productVariant.product.name} ${line.productVariant.name}`
                                                : line.productVariant.name}
                                        </TP>
                                        <Stack gap="0.75rem">
                                            <TP size="1.5rem">{t('orderSummary.quantity')} </TP>
                                            <TP size="1.5rem" weight={500}>
                                                {line.quantity}
                                            </TP>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Price
                                    currencyCode={currencyCode}
                                    price={line.unitPriceWithTax}
                                    discountPrice={line.discountedLinePriceWithTax / line.quantity}
                                    quantity={line.quantity}
                                />
                            </Stack>
                            <Divider style={{ marginBlock: '3rem' }} />
                        </Stack>
                    );
                })}
            </Stack>
        </Wrapper>
    );
};

const Wrapper = styled(Stack)`
    margin: 12rem 0 0 0;
`;
