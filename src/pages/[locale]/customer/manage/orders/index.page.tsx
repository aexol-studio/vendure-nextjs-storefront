import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { SSRQuery, storefrontApiQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, ActiveOrderSelector } from '@/src/graphql/selectors';
import { Stack } from '@/src/components/atoms/Stack';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Link } from '@/src/components/atoms/Link';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { SortOrder } from '@/src/zeus';
import styled from '@emotion/styled';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { priceFormatter } from '@/src/util/priceFomatter';
import { Button } from '@/src/components/molecules/Button';
import { Input } from '@/src/components/forms/Input';

const GET_MORE = 4;

const History: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [activeOrders, setActiveOrders] = useState(props.activeCustomer?.orders.items);

    const lookForOrder = async (contains: string) => {
        const { activeCustomer } = await storefrontApiQuery({
            activeCustomer: {
                ...ActiveCustomerSelector,
                orders: [
                    { options: { take: page * GET_MORE, skip: 0, filter: { code: { contains } } } },
                    { items: ActiveOrderSelector },
                ],
            },
        });
        if (!activeCustomer) {
            setActiveOrders([]);
            setLoading(false);
            return;
        }
        setActiveOrders(activeCustomer.orders.items);
        setLoading(false);
    };

    const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    useEffect(() => {
        if (query === '') return;
        setLoading(true);
        const timer = setTimeout(() => {
            lookForOrder(query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    const onLoadMore = async () => {
        const { activeCustomer } = await storefrontApiQuery({
            activeCustomer: {
                ...ActiveCustomerSelector,
                orders: [
                    { options: { take: GET_MORE, skip: activeOrders?.length, sort: { createdAt: SortOrder.DESC } } },
                    { items: ActiveOrderSelector },
                ],
            },
        });
        if (!activeCustomer) return;
        setActiveOrders([...(activeOrders || []), ...activeCustomer.orders.items]);
        setPage(p => p + 1);
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack w100 itemsStart gap="1.75rem">
                    <CustomerNavigation />
                    <Stack column w100>
                        <Input label="Search order" placeholder="Look for order by code" onChange={onSearch} />
                        <Wrap w100>
                            {loading ? (
                                <TP>Loading...</TP>
                            ) : (
                                activeOrders?.map(order => (
                                    <ClickableStack w100 key={order.id}>
                                        <AbsoluteLink href={`/customer/manage/orders/${order.id}`} />
                                        <ContentStack itemsCenter>
                                            {order.lines.length >= 4 ? (
                                                <ImageGrid>
                                                    {order.lines
                                                        .slice(0, 4)
                                                        ?.map(line => (
                                                            <ProductImage
                                                                size="thumbnail"
                                                                key={line.productVariant?.featuredAsset?.id}
                                                                src={line.productVariant?.featuredAsset?.preview}
                                                                alt={line.productVariant.product.name}
                                                            />
                                                        ))}
                                                </ImageGrid>
                                            ) : (
                                                <ProductImage
                                                    size="thumbnail"
                                                    src={order.lines[0].featuredAsset?.preview}
                                                    alt={order.lines[0].productVariant.product.name}
                                                />
                                            )}

                                            <TP>
                                                {order.state}
                                                &nbsp;
                                                {new Date(order.updatedAt).toISOString().split('T')[0]}
                                            </TP>
                                            <TP>State {order.state}</TP>
                                            <TP>Total quantity: {order.totalQuantity}</TP>
                                            <TP>
                                                Total price: {priceFormatter(order.totalWithTax, order.currencyCode)}
                                            </TP>
                                        </ContentStack>
                                    </ClickableStack>
                                ))
                            )}
                        </Wrap>
                        <Button onClick={onLoadMore}>Load more</Button>
                    </Stack>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const ImageGrid = styled(Stack)`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
`;

const Wrap = styled(Stack)`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 1.75rem;

    overflow-y: auto;
    max-height: 600px;
`;

const ContentStack = styled(Stack)`
    padding: 1.75rem;
    border: 1px solid ${({ theme }) => theme.gray(300)};
`;

const ClickableStack = styled(Stack)`
    position: relative;
`;

const AbsoluteLink = styled(Link)`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`;

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const destination = context.params?.locale === 'en' ? '/' : `/${context.params?.locale}`;

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: {
                ...ActiveCustomerSelector,
                orders: [{ options: { take: 4, sort: { createdAt: SortOrder.DESC } } }, { items: ActiveOrderSelector }],
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
export default History;
