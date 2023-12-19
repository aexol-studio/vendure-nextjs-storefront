import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from './components/CustomerNavigation';
import { Stack } from '@/src/components/atoms/Stack';
import { SSRQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector } from '@/src/graphql/selectors';
import { CustomerForm } from './components/CustomerForm';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';

const Account: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack itemsStart gap="1.75rem">
                    <CustomerNavigation />
                    <CustomerForm initialCustomer={props.activeCustomer} />
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const collections = await getCollections();
    const destination = context.params?.locale === 'en' ? '/' : `/${context.params?.locale}`;

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: ActiveCustomerSelector,
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
export default Account;
