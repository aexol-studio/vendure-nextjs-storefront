import React, { useEffect } from 'react';
import { Layout } from '@/src/layouts';
import { InferGetStaticPropsType } from 'next';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { OrderSummary } from '../components/OrderSummary';
import { OrderPayment } from '../components/OrderPayment';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Content, Main } from '../components/ui/Shared';
import { useRouter } from 'next/router';
import { useCart } from '@/src/state/cart';

const PaymentPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { cart } = useCart();
    const { push } = useRouter();

    useEffect(() => {
        if (!cart || cart.lines.length === 0) push('/');
    }, [cart]);

    return (
        <Layout categories={props.collections}>
            <Content>
                <Main>
                    <OrderPayment />
                    <OrderSummary />
                </Main>
            </Content>
        </Layout>
    );
};

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'checkout'])(context);
    const collections = await getCollections();

    return {
        props: { ...r.props, collections },
        revalidate: 10,
    };
};

export { getStaticPaths, getStaticProps };
export default PaymentPage;
