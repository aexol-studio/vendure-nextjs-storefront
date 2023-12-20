import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { SSRQuery } from '@/src/graphql/client';
import {
    ActiveCustomerSelector,
    ActiveOrderSelector,
    OrderAddressSelector,
    OrderAddressType,
} from '@/src/graphql/selectors';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { Link } from '@/src/components/atoms/Link';
import styled from '@emotion/styled';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Price } from '@/src/components/atoms/Price';
import { OrderState } from '@/src/components/molecules/OrderState';

const Order: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const order = props.activeCustomer?.orders.items?.[0];
    const currencyCode = order?.currencyCode;

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack itemsStart gap="1.75rem">
                    <CustomerNavigation />
                    <Stack column w100>
                        <Stack itemsStart justifyBetween>
                            <Stack column>
                                <TP size="2rem" weight={500}>
                                    Order code: {order?.code}
                                </TP>
                                <Link href="/customer/manage/orders">Go to orders</Link>
                            </Stack>
                            <OrderState size="medium" state={order?.state} />
                        </Stack>
                        <Content w100 column gap="2rem">
                            {order?.lines?.map(line => {
                                const optionInName =
                                    line.productVariant.name.replace(line.productVariant.product.name, '') !== '';
                                return (
                                    <Stack gap="2rem" w100 key={line.id}>
                                        <ProductImage
                                            size="thumbnail"
                                            src={
                                                line.productVariant.featuredAsset?.source ?? line.featuredAsset?.preview
                                            }
                                        />
                                        <Stack column>
                                            <TP size="1.5rem" weight={500} style={{ whiteSpace: 'nowrap' }}>
                                                {line.productVariant.product.name}
                                            </TP>
                                            {optionInName && (
                                                <TP size="1.25rem" weight={400} style={{ textTransform: 'capitalize' }}>
                                                    {line.productVariant.name.replace(
                                                        line.productVariant.product.name,
                                                        '',
                                                    )}
                                                </TP>
                                            )}
                                            <Price
                                                currencyCode={currencyCode}
                                                price={line.linePriceWithTax}
                                                discountPrice={line.discountedLinePriceWithTax}
                                            />
                                            <TP>{line.quantity}</TP>
                                        </Stack>
                                    </Stack>
                                );
                            })}
                        </Content>
                        <Stack>
                            {order?.shippingLines.map((shippingLine, idx) => (
                                <Stack column key={idx}>
                                    <TP size="1.5rem" weight={500}>
                                        {shippingLine.shippingMethod.name}
                                    </TP>
                                    <Price currencyCode={currencyCode} price={shippingLine.priceWithTax} />
                                </Stack>
                            ))}
                        </Stack>
                        <Stack gap="2.5rem">
                            <Stack column gap="2.5rem">
                                <Address address={order?.shippingAddress} />
                                <Address address={order?.billingAddress} />
                            </Stack>
                            <Stack column>
                                <TP>{order.customer?.emailAddress}</TP>
                                <Stack>
                                    <TP>
                                        {order.customer?.firstName} {order.customer?.lastName}
                                    </TP>
                                </Stack>
                                <TP>{order.customer?.phoneNumber}</TP>
                            </Stack>
                        </Stack>
                        <Price currencyCode={currencyCode} price={order?.totalWithTax} />

                        <Stack>
                            {order.discounts.map((d, idx) => {
                                return (
                                    <Stack key={idx}>
                                        <TP>{d.description}</TP>
                                        <Price currencyCode={currencyCode} price={d.amountWithTax} />
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Stack>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const Address: React.FC<{ address?: OrderAddressType }> = ({ address }) => {
    if (!address) return null;
    return (
        <Stack column>
            <TP size="1.5rem" weight={500}>
                {address.fullName}
            </TP>
            <TP>{address.streetLine1}</TP>
            <TP>{address.streetLine2}</TP>
            <TP>
                {address.city} {address.postalCode}
            </TP>
        </Stack>
    );
};

const Content = styled(Stack)`
    background-color: ${({ theme }) => theme.background.third};
    padding: 1.75rem;
`;

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const destination = context.params?.locale === 'en' ? '/' : `/${context.params?.locale}`;
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
