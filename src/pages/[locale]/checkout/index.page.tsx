import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { OrderSummary } from './components/OrderSummary';
import { OrderForm } from './components/OrderForm';
import { getCollections } from '@/src/graphql/sharedQueries';

const CheckoutPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    return (
        <Layout categories={props.collections}>
            <ContentContainer style={{ marginBlock: '4rem' }}>
                <Stack gap="5rem">
                    <OrderForm />
                    <OrderSummary />
                </Stack>
            </ContentContainer>
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
export default CheckoutPage;
