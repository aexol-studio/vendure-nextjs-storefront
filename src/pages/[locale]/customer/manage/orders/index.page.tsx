import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React, { useEffect, useState } from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { storefrontApiQuery } from '@/src/graphql/client';
import { ActiveOrderSelector, ActiveOrderType } from '@/src/graphql/selectors';
import { Stack } from '@/src/components/atoms/Stack';

const History: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const [orders, setOrders] = useState<ActiveOrderType[]>();

    useEffect(() => {
        const fetchCustomer = async () => {
            const { activeCustomer } = await storefrontApiQuery({
                activeCustomer: {
                    orders: [{ options: { take: 20 } }, { items: ActiveOrderSelector }],
                },
            });
            setOrders(activeCustomer?.orders.items);
        };
        fetchCustomer();
    }, []);
    console.log(orders);
    return (
        <Layout categories={props.collections}>
            <CustomerNavigation />
            <Stack column>{orders?.map(order => <div key={order.id}>{order.subTotalWithTax}</div>)}</Stack>
        </Layout>
    );
};

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'checkout'])(context);
    const collections = await getCollections();

    const returnedStuff = {
        ...r.props,
        collections,
    };

    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export { getStaticPaths, getStaticProps };
export default History;
