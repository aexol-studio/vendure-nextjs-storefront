import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';

const Verify: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    return (
        <Layout categories={props.collections}>
            {props.status.success ? (
                <div>
                    <Link href="/customer/sign-in">{t('signIn')}</Link>
                </div>
            ) : (
                <div>
                    <Link href="/">{t('home')}</Link>
                </div>
            )}
        </Layout>
    );
};

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const token = context.query.token as string;
    const homePage = context.params?.locale === 'en' ? '/' : `/${context.params?.locale}`;

    try {
        const { verifyCustomerAccount } = await storefrontApiMutation({
            verifyCustomerAccount: [
                { token },
                {
                    __typename: true,
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
        });

        let success = false;
        if (verifyCustomerAccount.__typename === 'CurrentUser') success = true;

        return { props: { ...r.props, collections, status: { success } } };
    } catch (e) {
        return { redirect: { destination: homePage, permanent: false } };
    }
};

export { getServerSideProps };
export default Verify;
