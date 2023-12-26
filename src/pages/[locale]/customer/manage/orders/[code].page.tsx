import { Layout } from '@/src/layouts';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { SSRQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, ActiveOrderSelector, OrderAddressSelector } from '@/src/graphql/selectors';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { Link } from '@/src/components/atoms/Link';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Price } from '@/src/components/atoms/Price';
import { useTranslation } from 'next-i18next';
import { CustomerOrderStates } from './components/CustomerOrderStates';
import { OrderPaymentState } from './components/OrderPaymentState';
import { OrderAddress } from './components/OrderAddress';
import { CreditCard, Mail, MoveLeft, PackageCheck, Phone, ShoppingCart, Truck, User } from 'lucide-react';
import styled from '@emotion/styled';
import { OrderLine } from './components/OrderLine';
import { Divider } from '@/src/components/atoms/Divider';
import { Discounts } from '@/src/components/molecules/Discounts';

const Order: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    const order = props.activeCustomer?.orders.items?.[0];
    const currencyCode = order?.currencyCode;

    //TODO: Now we will display only one method of payment
    const paymentMethod = order?.payments?.[0];
    //TODO: Now we will display only one method of shipping
    const shippingMethod = order?.shippingLines?.[0];

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack itemsStart gap="1.75rem">
                    <CustomerNavigation />
                    <Stack column w100 gap="3.5rem">
                        <Stack column gap="1.5rem">
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
                            <CustomerOrderStates state={order?.state} />
                        </Stack>
                        <Stack w100>
                            <Stack w100 column gap="2.5rem">
                                <Stack column>
                                    <Stack gap="0.25rem" itemsCenter>
                                        <ShoppingCart size={'1.6rem'} />
                                        <TP size="1.25rem" weight={500}>
                                            {t('orderPage.customerDetails')}
                                        </TP>
                                    </Stack>
                                    <Stack column>
                                        <Stack itemsCenter gap="0.25rem">
                                            <User size={'1.6rem'} />
                                            <TP>
                                                {order.customer?.firstName} {order.customer?.lastName}
                                            </TP>
                                        </Stack>
                                        <Stack itemsCenter gap="0.25rem">
                                            <Mail size={'1.6rem'} />
                                            <TP>{order.customer?.emailAddress}</TP>
                                        </Stack>
                                        <Stack itemsCenter gap="0.25rem">
                                            <Phone size={'1.6rem'} />
                                            <TP>{order.customer?.phoneNumber}</TP>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Stack w100 gap="3.5rem">
                                    <Stack column gap="0.5rem">
                                        <Stack gap="0.25rem" itemsCenter>
                                            <Truck size={'1.6rem'} />
                                            <TP size="1.25rem" weight={500}>
                                                {t('orderPage.shippingAddress')}
                                            </TP>
                                        </Stack>
                                        <OrderAddress address={order?.shippingAddress} />
                                    </Stack>
                                    <Stack column gap="0.5rem">
                                        <Stack gap="0.25rem" itemsCenter>
                                            <CreditCard size={'1.6rem'} />
                                            <TP size="1.25rem" weight={500}>
                                                {t('orderPage.billingAddress')}
                                            </TP>
                                        </Stack>
                                        <OrderAddress address={order?.billingAddress} />
                                    </Stack>
                                </Stack>
                                <Stack column gap="0.5rem">
                                    <Stack gap="0.25rem" itemsCenter>
                                        <PackageCheck size={'1.6rem'} />
                                        <TP size="1.25rem" weight={500}>
                                            {t('orderPage.shippingMethod')}
                                        </TP>
                                    </Stack>
                                    <Stack itemsCenter>
                                        <Price currencyCode={currencyCode} price={shippingMethod?.priceWithTax} />
                                        <TP>&nbsp;- {shippingMethod?.shippingMethod.name}</TP>
                                    </Stack>
                                </Stack>
                            </Stack>
                            <Stack column w100>
                                <Stack w100 column gap="2.5rem">
                                    {order?.lines?.map(line => (
                                        <OrderLine key={line.id} currencyCode={currencyCode} line={line} />
                                    ))}
                                </Stack>
                                <StyledDivider />
                                <Discounts withLabel discounts={order.discounts} currencyCode={currencyCode} />
                                <Stack column>
                                    <TP size="1.5rem" weight={500}>
                                        {t('orderPage.totalPrice')}
                                    </TP>
                                    <Price currencyCode={currencyCode} price={order?.totalWithTax} />
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
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

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const destination = prepareSSRRedirect('/')(context);
    const code = context.params?.code as string;

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: {
                ...ActiveCustomerSelector,
                orders: [
                    { options: { filter: { code: { eq: code } } } },
                    {
                        items: {
                            ...ActiveOrderSelector,
                            billingAddress: OrderAddressSelector,
                            shippingAddress: OrderAddressSelector,
                        },
                    },
                ],
            },
        });
        if (!activeCustomer) throw new Error('No active customer');

        const returnedStuff = {
            ...r.props,
            collections,
            activeCustomer,
        };

        return { props: returnedStuff };
    } catch (error) {
        return { redirect: { destination, permanent: false } };
    }
};

export { getServerSideProps };
export default Order;
