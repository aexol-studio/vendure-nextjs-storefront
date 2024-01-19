import { Layout } from '@/src/layouts';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import styled from '@emotion/styled';
import { Divider, ContentContainer, Stack, Link, TP, Price } from '@/src/components/atoms';
import { useTranslation } from 'next-i18next';

import { CreditCard, MoveLeft, ShoppingCart, Truck } from 'lucide-react';
import { Discounts } from '@/src/components/molecules/Discounts';

import { OrderLine } from '../components/OrderLine';
import { OrderShippingStatus } from '../components/OrderShippingStatus';
import { OrderPaymentState } from '../components/OrderPaymentState';
import { OrderAddress } from '../components/OrderAddress';
import { CustomerOrderStatus } from '../components/CustomerOrderStates';
import { OrderCustomer } from '../components/OrderCustomer';
import { getServerSideProps } from './props';
import { CustomerWrap } from '../../../components/shared';
import { CustomerNavigation } from '../../components/CustomerNavigation';

export const OrderPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    const order = props.activeCustomer?.orders.items?.[0];
    const currencyCode = order?.currencyCode;

    const paymentMethod = order?.payments?.[0];
    const shippingMethod = order?.shippingLines?.[0];

    return (
        <Layout
            categories={props.collections}
            navigation={props.navigation}
            pageTitle={`${t('orderPage.title')} #${order?.code}`}>
            <ContentContainer>
                <Stack w100 justifyEnd>
                    <CustomerNavigation />
                </Stack>
                <CustomerWrap itemsStart gap="1.75rem">
                    <Stack column w100 gap="3.5rem">
                        <Stack column gap="2.5rem">
                            <StyledLink href="/customer/manage/orders">
                                <MoveLeft size={20} />
                                {t('orderPage.backToOrders')}
                            </StyledLink>
                            <Stack itemsStart justifyBetween>
                                <Stack column gap="0.25rem">
                                    <TP size="2rem" weight={500}>
                                        {t('orderPage.orderCode')}
                                    </TP>
                                    <TP>#{order?.code}</TP>
                                </Stack>
                                <OrderPaymentState payment={paymentMethod} />
                            </Stack>
                            <CustomerOrderStatus state={order?.state} />
                        </Stack>
                        <Stack w100 justifyBetween gap="2.5rem">
                            <Stack w100 column gap="2.5rem">
                                <OrderCustomer customer={order?.customer} />
                                <OrderShippingStatus
                                    currencyCode={currencyCode}
                                    shipping={shippingMethod}
                                    label={t('orderPage.shippingMethod')}
                                />
                                <Stack w100 gap="3.5rem">
                                    <OrderAddress
                                        address={order?.shippingAddress}
                                        label={t('orderPage.shippingAddress')}
                                        icon={<Truck size={'1.6rem'} />}
                                    />
                                    <OrderAddress
                                        address={order?.billingAddress}
                                        label={t('orderPage.billingAddress')}
                                        icon={<CreditCard size={'1.6rem'} />}
                                    />
                                </Stack>
                            </Stack>
                            <Stack column>
                                <Stack w100 column gap="2.5rem">
                                    <Stack gap="0.5rem" itemsCenter>
                                        <ShoppingCart size={'1.6rem'} />
                                        <TP size="1.25rem" weight={500}>
                                            {t('orderPage.items')}
                                        </TP>
                                    </Stack>
                                    {order?.lines?.map(line => (
                                        <OrderLine key={line.id} currencyCode={currencyCode} line={line} />
                                    ))}
                                </Stack>
                                <StyledDivider />
                                {order?.discounts.length > 0 ? (
                                    <Discounts withLabel discounts={order.discounts} currencyCode={currencyCode} />
                                ) : null}
                                <Stack column>
                                    <TP size="1.5rem" weight={500}>
                                        {t('orderPage.totalPrice')}
                                    </TP>
                                    <Price currencyCode={currencyCode} price={order?.totalWithTax} />
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </CustomerWrap>
            </ContentContainer>
        </Layout>
    );
};

const StyledDivider = styled(Divider)`
    width: 100%;
    margin: 1.75rem 0;
`;

const StyledLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${p => p.theme.text.main};
`;
