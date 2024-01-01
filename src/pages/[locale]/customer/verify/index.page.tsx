import { Layout } from '@/src/layouts';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { Banner } from '@/src/components/forms';
import { TH2 } from '@/src/components/atoms/TypoGraphy';
import { arrayToTree } from '@/src/util/arrayToTree';

import { Absolute, FormContainer, FormContent, FormWrapper } from '../components/shared';

const Verify: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    const { t: tError } = useTranslation('common');
    return (
        <Layout categories={props.collections} navigation={props.navigation} pageTitle={t('verify.title')}>
            <ContentContainer>
                <FormContainer>
                    <FormWrapper column itemsCenter gap="3.5rem">
                        <FormContent w100 column itemsCenter gap="1.75rem">
                            {props.status.verifyCustomerAccount.__typename !== 'CurrentUser' ? (
                                <>
                                    <Absolute w100>
                                        <Banner
                                            initial={{ opacity: 1 }}
                                            error={{
                                                message: tError(
                                                    `errors.backend.${props.status.verifyCustomerAccount.errorCode}`,
                                                ),
                                            }}
                                        />
                                    </Absolute>
                                    <Stack>
                                        <TH2>{t('verify.fail')}</TH2>
                                        <Link href="/">{t('home')}</Link>
                                    </Stack>
                                </>
                            ) : (
                                <Stack>
                                    <TH2>{t('verify.success')}</TH2>
                                    <Link href="/customer/sign-in">{t('signIn')}</Link>
                                </Stack>
                            )}
                        </FormContent>
                    </FormWrapper>
                </FormContainer>
            </ContentContainer>
        </Layout>
    );
};

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const navigation = arrayToTree(collections);

    const token = context.query.token as string;
    const homePageRedirect = prepareSSRRedirect('/')(context);

    if (!token) return homePageRedirect;

    try {
        const { verifyCustomerAccount } = await storefrontApiMutation({
            verifyCustomerAccount: [
                { token },
                {
                    __typename: true,
                    '...on CurrentUser': { id: true },
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

        return { props: { ...r.props, collections, status: { verifyCustomerAccount }, navigation } };
    } catch (e) {
        return homePageRedirect;
    }
};

export { getServerSideProps };
export default Verify;
