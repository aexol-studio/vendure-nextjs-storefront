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
            <ContentContainer>
                <Stack>
                    <Stack column>
                        <OrderForm />
                    </Stack>
                    <Stack style={{ width: '100%', position: 'sticky', top: '96px', height: 'fit-content' }}>
                        <OrderSummary />
                    </Stack>
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
