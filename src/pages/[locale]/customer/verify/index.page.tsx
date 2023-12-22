import { Layout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { AbsoluteError, FormContent, FormWrapper } from '../components/FormWrapper';
import { ErrorBanner } from '@/src/components/forms/ErrorBanner';

const Verify: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    const { t: tError } = useTranslation('common');
    //TODO: Add error handling
    const { verifyCustomerAccount } = props.status;
    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack column gap="3.5rem" w100 justifyCenter itemsCenter style={{ minHeight: 'calc(100vh - 6rem)' }}>
                    <FormWrapper column itemsCenter gap="3.5rem">
                        <FormContent w100 column itemsCenter gap="1.75rem">
                            {verifyCustomerAccount.__typename !== 'CurrentUser' ? (
                                <AbsoluteError w100>
                                    <ErrorBanner
                                        initial={{ opacity: 1 }}
                                        error={{
                                            root: {
                                                message: tError(`errors.backend.${verifyCustomerAccount.errorCode}`),
                                            },
                                        }}
                                    />
                                </AbsoluteError>
                            ) : null}

                            {props.status.success ? (
                                <Link href="/customer/sign-in">{t('signIn')}</Link>
                            ) : (
                                <Link href="/">{t('home')}</Link>
                            )}
                        </FormContent>
                    </FormWrapper>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const token = context.query.token as string;
    const destination = r.props._nextI18Next?.initialLocale === 'en' ? '/' : `/${r.props._nextI18Next?.initialLocale}`;

    if (!token) return { redirect: { destination, permanent: false } };

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

        return { props: { ...r.props, collections, status: { success, verifyCustomerAccount } } };
    } catch (e) {
        return { redirect: { destination, permanent: false } };
    }
};

export { getServerSideProps };
export default Verify;
