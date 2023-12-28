import { Layout } from '@/src/layouts';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { SSRQuery, storefrontApiQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, ActiveOrderSelector } from '@/src/graphql/selectors';
import { Stack } from '@/src/components/atoms/Stack';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { SortOrder } from '@/src/zeus';
import styled from '@emotion/styled';
import { Button } from '@/src/components/molecules/Button';
import { Input } from '@/src/components/forms/Input';
import { useTranslation } from 'next-i18next';
import { OrderBox } from './components/OrderBox';

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
                    {
                        options: {
                            take: page * GET_MORE,
                            skip: page * GET_MORE - GET_MORE,

                            filter: { code: { contains } },
                        },
                    },
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

        setActiveOrders([...(activeOrders || []), ...activeCustomer.orders.items]);
        setPage(page + 1);
        await new Promise(resolve => setTimeout(resolve, 200));
        scrollableRef.current?.scrollTo({ top: scrollableRef.current?.scrollHeight, behavior: 'smooth' });
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <CustomerWrap w100 itemsStart gap="1.75rem">
                    <CustomerNavigation />
                    <Stack column w100 gap="1rem">
                        <TP size="2.5rem" weight={600}>
                            {t('ordersPage.title')}
                        </TP>
                        <Main column w100>
                            <Input label="Search order" placeholder="Look for order by code" onChange={onSearch} />
                            <Wrap flexWrap w100 ref={scrollableRef}>
                                {!loading ? (
                                    activeOrders?.map(order => <OrderBox key={order.id} order={order} />)
                                ) : (
                                    <TP>{t('ordersPage.loading')}</TP>
                                )}
                            </Wrap>
                            {props.activeCustomer?.orders.totalItems > activeOrders?.length && (
                                <ButtonWrap w100>
                                    <StyledButton onClick={onLoadMore}>{t('ordersPage.loadMore')}</StyledButton>
                                </ButtonWrap>
                            )}
                        </Main>
                    </Stack>
                </CustomerWrap>
            </ContentContainer>
        </Layout>
    );
};

const CustomerWrap = styled(Stack)`
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        flex-direction: column;
    }
`;

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
        background: ${({ theme }) => theme.shadow};
        border-radius: 1rem;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: ${p => p.theme.gray(400)};
    }
`;

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const destination = prepareSSRRedirect('/')(context);

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: {
                ...ActiveCustomerSelector,
                orders: [
                    { options: { take: 4, sort: { createdAt: SortOrder.DESC }, filter: { active: { eq: false } } } },
                    { items: ActiveOrderSelector, totalItems: true },
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
        return destination;
    }
};

export { getServerSideProps };
export default History;
