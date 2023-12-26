import React, { useEffect, useState } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRQuery, storefrontApiQuery } from '@/src/graphql/client';
import { OrderSelector, OrderType } from '@/src/graphql/selectors';
import { Layout } from '@/src/layouts';
import { OrderConfirmation } from '../components/OrderConfirmation';
import { Content } from '../components/ui/Shared';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { usePush } from '@/src/lib/redirect';
import { getCollections } from '@/src/graphql/sharedQueries';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';

const ConfirmationPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const [order, setOrder] = useState<OrderType>(props.order);
    const push = usePush();
    const maxRetries = 3;

    useEffect(() => {
        let retries = 0;

        const fetchOrder = async () => {
            try {
                const { orderByCode } = await storefrontApiQuery({
                    orderByCode: [{ code: props.code }, OrderSelector],
                });
                if (orderByCode) {
                    setOrder(orderByCode);
                } else throw new Error('Order not found');
            } catch (error) {
                retries++;
                if (retries <= maxRetries) {
                    setTimeout(fetchOrder, 1000);
                } else push('/');
            }
        };

        if (!order && props.code) fetchOrder();
    }, []);

    return (
        <Layout categories={props.collections}>
            {order ? (
                <Content>
                    <OrderConfirmation code={props.code} order={order} />
                </Content>
            ) : (
                <Content>
                    <Stack w100 justifyCenter itemsCenter>
                        <TP>Order not found</TP>
                    </Stack>
                </Content>
            )}
        </Layout>
    );
};

const getServerSideProps: GetServerSideProps = async context => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);

    const collections = await getCollections();
    const code = context.params?.code as string;
    if (!code) return { props: { ...r.props } };

    try {
        const { orderByCode } = await SSRQuery(context)({
            orderByCode: [{ code }, OrderSelector],
        });

        if (!orderByCode) throw new Error(`Order not ready yet ${code}`);

        return { props: { ...r.props, collections, code, order: orderByCode } };
    } catch (e) {
        return { props: { ...r.props, collections, code, order: null } };
    }
};

export { getServerSideProps };
export default ConfirmationPage;
