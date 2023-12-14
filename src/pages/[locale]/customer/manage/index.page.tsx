import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React, { useEffect, useState } from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from './components/CustomerNavigation';
import { Stack } from '@/src/components/atoms/Stack';
import { SubmitHandler, useForm } from 'react-hook-form';
import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import { Button } from '@/src/components/molecules/Button';
import { ActiveCustomerSelector, ActiveCustomerType } from '@/src/graphql/selectors';

type Form = {
    firstName: ActiveCustomerType['firstName'];
    lastName: ActiveCustomerType['lastName'];
    phoneNumber: ActiveCustomerType['phoneNumber'];
};

const Account: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const [activeCustomer, setActiveCustomer] = useState<ActiveCustomerType>();

    useEffect(() => {
        const fetchCustomer = async () => {
            const { activeCustomer } = await storefrontApiQuery({
                activeCustomer: ActiveCustomerSelector,
            });
            setActiveCustomer(activeCustomer);
        };
        fetchCustomer();
    }, []);

    console.log(activeCustomer);
    const { register, handleSubmit } = useForm<Form>({
        values: {
            firstName: activeCustomer?.firstName || '',
            lastName: activeCustomer?.lastName || '',
            phoneNumber: activeCustomer?.phoneNumber,
        },
    });

    const onSubmit: SubmitHandler<Form> = async data => {
        const { updateCustomer } = await storefrontApiMutation({
            updateCustomer: [
                { input: { firstName: data.firstName, lastName: data.lastName, phoneNumber: data.phoneNumber } },
                { __typename: true, id: true },
            ],
        });
        console.log(updateCustomer);
    };

    return (
        <Layout categories={props.collections}>
            <CustomerNavigation />
            <Stack>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input {...register('firstName')} />
                    <input {...register('lastName')} />
                    <input {...register('phoneNumber')} />
                    <Button type="submit">Submit</Button>
                </form>
            </Stack>
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
