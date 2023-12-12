import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from './components/CustomerNavigation';
import { Stack } from '@/src/components/atoms/Stack';
import { SubmitHandler, useForm } from 'react-hook-form';
import { storefrontApiMutation } from '@/src/graphql/client';

type Form = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
};

const Account: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { register } = useForm<Form>();
    const onSubmit: SubmitHandler<Form> = async data => {
        const {} = await storefrontApiMutation({
            updateCustomer: [
                { input: { firstName: data.firstName, lastName: data.lastName, phoneNumber: data.phoneNumber } },
                { __typename: true, id: true },
            ],
        });
    };
    return (
        <Layout categories={props.collections}>
            <CustomerNavigation />
            <Stack></Stack>
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
export default Account;
