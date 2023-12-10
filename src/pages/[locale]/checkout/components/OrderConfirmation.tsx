import React from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { CheckoutStatus } from '../components/CheckoutStatus';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';

import { Divider } from '@/src/components/atoms/Divider';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { CheckCircle2 } from 'lucide-react';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';
import { OrderType } from '@/src/graphql/selectors';
import { Trans, useTranslation } from 'next-i18next';

export const OrderConfirmation: React.FC<{ code: string; order?: OrderType }> = ({ code, order }) => {
    const { t } = useTranslation('checkout');
    const currencyCode = order?.currencyCode || CurrencyCode.USD;
    return (
        <Stack column>
            <Stack style={{ paddingBlock: '2rem' }}>
                <CheckoutStatus step={'confirmation'} />
            </Stack>
            <Stack column gap="4rem">
                <Stack justifyBetween>
                    <Stack column gap="4rem">
                        <Stack itemsCenter gap="2rem">
                            <CheckCircle2 color="green" size={44} />
                            <TH2>{t('orderSummary.title')}</TH2>
                        </Stack>
                        <TP size="2rem">
                            <Trans
                                i18nKey="confirmation.orderReceived"
                                t={t}
                                values={{ code }}
                                components={{ 1: <strong></strong> }}
                            />
                        </TP>
                    </Stack>
                    <Stack column gap="1rem">
                        <Stack justifyBetween>
                            <TP>{t('orderSummary.subtotal')}</TP>
                            <TP weight={600}>{priceFormatter(order?.subTotalWithTax || 0, currencyCode)}</TP>
                        </Stack>
                        <Stack justifyBetween>
                            <TP>{t('orderSummary.shipping')}</TP>
                            <TP weight={600}> {priceFormatter(order?.shippingWithTax || 0, currencyCode)}</TP>
                        </Stack>
                        <Divider />
                        <Stack justifyBetween>
                            <TP>{t('orderSummary.total')}</TP>
                            <TP weight={600}>{priceFormatter(order?.totalWithTax || 0, currencyCode)}</TP>
                        </Stack>
                    </Stack>
                </Stack>
                <Divider style={{ marginBlock: '4rem' }} />
                {order?.lines.map(line => {
                    const isDefaultVariant = line.productVariant.name.includes(line.productVariant.product.name);
                    return (
                        <Stack key={line.productVariant.name} column>
                            <Stack justifyBetween>
                                <Stack gap="3rem">
                                    <ProductImage src={line.featuredAsset?.preview} size="thumbnail-big" />
                                    <Stack column>
                                        <TP size="2rem" weight={600} style={{ paddingBottom: '2rem' }}>
                                            {!isDefaultVariant
                                                ? `${line.productVariant.product.name} ${line.productVariant.name}`
                                                : line.productVariant.name}
                                        </TP>
                                        <Stack gap="1rem">
                                            <TP size="1.75rem">{t('orderSummary.quantity')} </TP>
                                            <TP size="1.75rem" weight={600}>
                                                {line.quantity}
                                            </TP>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <TP size="2rem" weight={600}>
                                    {priceFormatter(line.linePriceWithTax, line.productVariant.currencyCode)}
                                </TP>
                            </Stack>
                            <Divider style={{ marginBlock: '3rem' }} />
                        </Stack>
                    );
                })}
            </Stack>
        </Stack>
    );
};
