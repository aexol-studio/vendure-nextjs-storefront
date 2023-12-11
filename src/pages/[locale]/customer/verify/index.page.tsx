import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React, { useEffect } from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { useRouter } from 'next/router';
import { storefrontApiMutation } from '@/src/graphql/client';

const Verify: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { query } = useRouter();
    const token = query.token as string;

    useEffect(() => {
        storefrontApiMutation({
            verifyCustomerAccount: [
                { token },
                {
                    '...on CurrentUser': {
                        id: true,
                    },
                    '...on MissingPasswordError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on NativeAuthStrategyError': {
                        errorCode: true,
                        message: true,
                    },
                    '...on PasswordAlreadySetError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on VerificationTokenInvalidError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on PasswordValidationError': {
                        errorCode: true,
                        message: true,
                        validationErrorMessage: true,
                    },
                    '...on VerificationTokenExpiredError': {
                        message: true,
                        errorCode: true,
                    },
                },
            ],
        }).then(r => console.log(r));
    }, [token]);

    return (
        <Layout categories={props.collections}>
            <div></div>
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
export default Verify;
