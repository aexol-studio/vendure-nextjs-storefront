import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
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
import { Button } from '@/src/components/molecules/Button';
import { Input } from '@/src/components/forms/Input';
import { Price } from '@/src/components/atoms/Price';
import { OrderState } from '@/src/components/molecules/OrderState';
import { useTranslation } from 'next-i18next';
import { dateFormatter } from '@/src/util/dateFormatter';

const GET_MORE = 4;

const History: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const scrollableRef = useRef<HTMLDivElement>(null);
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
        if (query === '') {
            setActiveOrders(props.activeCustomer?.orders.items);
            setLoading(false);
            return;
        }
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
                    { items: ActiveOrderSelector, totalItems: true },
                ],
            },
        });

        if (!activeCustomer) return;
        if (activeCustomer.orders.totalItems <= activeOrders?.length + GET_MORE) {
            //TODO: show no more orders
            return;
        }

        setActiveOrders([...(activeOrders || []), ...activeCustomer.orders.items]);
        setPage(page + 1);
        await new Promise(resolve => setTimeout(resolve, 200));
        scrollableRef.current?.scrollTo({ top: scrollableRef.current?.scrollHeight, behavior: 'smooth' });
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack w100 itemsStart gap="1.75rem">
                    <CustomerNavigation />
                    <Stack column w100 gap="1rem">
                        <TP size="2.5rem" weight={600}>
                            {t('ordersPage.title')}
                        </TP>
                        <Main column w100>
                            <Input label="Search order" placeholder="Look for order by code" onChange={onSearch} />
                            <Wrap flexWrap w100 ref={scrollableRef}>
                                {loading ? (
                                    <TP>{t('ordersPage.loading')}</TP>
                                ) : (
                                    activeOrders?.map(order => {
                                        return (
                                            <ClickableStack w100 key={order.id}>
                                                <AbsoluteLink href={`/customer/manage/orders/${order.code}`} />
                                                <ContentStack w100 itemsStart gap="1.75rem">
                                                    <Stack justifyBetween w100>
                                                        <Stack column w100 gap="0.75rem">
                                                            <Stack gap="1.75rem" itemsStart>
                                                                <ProductImage
                                                                    size="thumbnail"
                                                                    src={order.lines[0].featuredAsset?.preview}
                                                                    alt={order.lines[0].productVariant.product.name}
                                                                />
                                                                <Stack w100 column>
                                                                    <TP size="1.5rem" weight={500}>
                                                                        {t('ordersPage.orderDate')}:&nbsp;
                                                                    </TP>
                                                                    <TP>{dateFormatter(order.createdAt)}</TP>
                                                                </Stack>
                                                            </Stack>
                                                            <Stack column w100>
                                                                <Stack w100 itemsCenter>
                                                                    <TP size="1.5rem" weight={500}>
                                                                        {t('ordersPage.totalQuantity')}:&nbsp;
                                                                    </TP>
                                                                    <TP>{order.totalQuantity}</TP>
                                                                </Stack>
                                                                <Stack w100 itemsCenter>
                                                                    <TP size="1.5rem" weight={500}>
                                                                        {t('ordersPage.totalItems')}:&nbsp;
                                                                    </TP>
                                                                    <TP>{order.lines.length}</TP>
                                                                </Stack>
                                                                <Stack w100 itemsCenter>
                                                                    <TP size="1.5rem" weight={500}>
                                                                        {t('ordersPage.totalPrice')}:&nbsp;
                                                                    </TP>
                                                                    <Price
                                                                        currencyCode={order.currencyCode}
                                                                        price={order.totalWithTax}
                                                                    />
                                                                </Stack>
                                                            </Stack>
                                                        </Stack>
                                                    </Stack>
                                                    <OrderState state={order.state} column />
                                                </ContentStack>
                                            </ClickableStack>
                                        );
                                    })
                                )}
                            </Wrap>
                            <ButtonWrap w100>
                                <StyledButton onClick={onLoadMore}>{t('ordersPage.loadMore')}</StyledButton>
                            </ButtonWrap>
                        </Main>
                    </Stack>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const Main = styled(Stack)`
    padding: 1.75rem;
`;

const ButtonWrap = styled(Stack)`
    padding: 1rem;
`;

const StyledButton = styled(Button)`
    width: 100%;
`;

const Wrap = styled(Stack)`
    position: relative;

    max-height: 60vh;
    overflow-y: auto;

    ::-webkit-scrollbar {
        height: 0.8rem;
        width: 0.8rem;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: ${p => p.theme.gray(200)};
        border-radius: 1rem;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: ${p => p.theme.gray(400)};
    }
`;

const ContentStack = styled(Stack)`
    padding: 1.75rem;
    box-shadow: 0 0 0.75rem ${p => p.theme.gray(200)};
`;

const ClickableStack = styled(Stack)`
    width: 50%;
    height: 20rem;
    padding: 1rem;
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
                orders: [
                    { options: { take: 4, sort: { createdAt: SortOrder.DESC }, filter: { active: { eq: false } } } },
                    { items: ActiveOrderSelector },
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
export default History;
