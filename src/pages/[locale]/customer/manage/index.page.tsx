import { Layout } from '@/src/layouts';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from './components/CustomerNavigation';
import { SSRQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, ActiveOrderSelector } from '@/src/graphql/selectors';
import { CustomerForm } from './components/CustomerForm';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { SortOrder } from '@/src/zeus';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Account: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <CustomerWrap
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                    }}>
                    <CustomerNavigation />
                    <CustomerForm initialCustomer={props.activeCustomer} order={props.lastOrder} />
                </CustomerWrap>
            </ContentContainer>
        </Layout>
    );
};

const CustomerWrap = styled(motion.div)`
    justify-content: flex-start;
    gap: 1.75rem;
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        flex-direction: column;
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
                    { options: { take: 1, sort: { updatedAt: SortOrder.DESC }, filter: { active: { eq: false } } } },
                    { items: ActiveOrderSelector },
                ],
            },
        });
        if (!activeCustomer) throw new Error('No active customer');

        const { orders, ...customer } = activeCustomer;

        const returnedStuff = {
            ...r.props,
            collections,
            activeCustomer: customer,
            lastOrder: orders.items && orders.items.length > 0 ? orders.items[0] : null,
        };

        return { props: returnedStuff };
    } catch (error) {
        return destination;
    }
};

export { getServerSideProps };
export default Account;
