import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Button } from '@/src/components/molecules/Button';
import { storefrontApiMutation } from '@/src/graphql/client';

const Account: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const onClick = async () => {
        const { logout } = await storefrontApiMutation({
            logout: { success: true },
        });
        console.log(logout);
    };
    return (
        <Layout categories={props.collections}>
            <Button onClick={onClick}>Logout</Button>
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
