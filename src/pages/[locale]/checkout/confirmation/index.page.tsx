import React, { useEffect, useState } from 'react';
import { InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { getCollections } from '@/src/graphql/sharedQueries';
import { storefrontApiQuery } from '@/src/graphql/client';
import { OrderSelector, OrderType } from '@/src/graphql/selectors';
import { Layout } from '@/src/layouts';
import { OrderConfirmation } from '../components/OrderConfirmation';
import { Content } from '../components/ui/Shared';

const ConfirmationPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { query } = useRouter();
    const code = query.code as string;
    const [order, setOrder] = useState<OrderType>();
    const router = useRouter();
    const maxRetries = 3;

    useEffect(() => {
        let retries = 0;

        const fetchOrder = async () => {
            try {
                const r = await storefrontApiQuery({
                    orderByCode: [{ code }, OrderSelector],
                });
                if (r.orderByCode) {
                    setOrder(r.orderByCode);
                } else throw new Error('Order not found');
            } catch (error) {
                retries++;
                if (retries <= maxRetries) {
                    setTimeout(fetchOrder, 1000);
                } else router.push('/');
            }
        };

        if (!code) router.push('/');
        else fetchOrder();
    }, [code]);

    return code ? (
        <Layout categories={props.collections}>
            <Content>
                <OrderConfirmation code={code} order={order} />
            </Content>
        </Layout>
    ) : null;
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
export default ConfirmationPage;
