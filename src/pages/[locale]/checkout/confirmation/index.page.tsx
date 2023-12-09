import React, { useEffect, useState } from 'react';
import { InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';

import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';

import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { getCollections } from '@/src/graphql/sharedQueries';
import { storefrontApiQuery } from '@/src/graphql/client';

import { CheckoutStatus } from '../components/ui/CheckoutStatus';

const ConfirmationPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { query } = useRouter();
    const code = query.code as string;

    const [order, setOrder] = useState<{
        code: string;
        active: boolean;
    }>();
    console.log(order);

    useEffect(() => {
        storefrontApiQuery({
            orderByCode: [{ code }, { active: true, code: true }],
        }).then(r => {
            setOrder(r?.orderByCode);
        });
    }, [code]);

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack>
                    <CheckoutStatus step={'confirmation'} />
                </Stack>
            </ContentContainer>
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
export default ConfirmationPage;
