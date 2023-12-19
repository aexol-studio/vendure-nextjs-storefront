import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { SSRQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, ActiveOrderSelector } from '@/src/graphql/selectors';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { Link } from '@/src/components/atoms/Link';

const Order: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack itemsStart gap="1.75rem">
                    <CustomerNavigation />
                    <Stack>
                        <Link href="/customer/manage/orders">Back to orders</Link>
                    </Stack>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const collections = await getCollections();
    const destination = context.params?.locale === 'en' ? '/' : `/${context.params?.locale}`;
    const id = context.params?.id as string;

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: ActiveCustomerSelector,
        });
        if (!activeCustomer) throw new Error('No active customer');

        const { order } = await SSRQuery(context)({
            order: [{ id }, ActiveOrderSelector],
        });

        const returnedStuff = {
            ...r.props,
            collections,
            activeCustomer,
            order,
        };

        return { props: returnedStuff };
    } catch (error) {
        return { redirect: { destination, permanent: false } };
    }
};

export { getServerSideProps };
export default Order;
