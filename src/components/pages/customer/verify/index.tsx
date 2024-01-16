import { Layout } from '@/src/layouts';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { Banner } from '@/src/components/forms';
import { TP } from '@/src/components/atoms/TypoGraphy';

import { Absolute, FormContainer, FormWrapper } from '../components/shared';
import { getServerSideProps } from './props';

export const VerifyPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    const { t: tError } = useTranslation('common');
    return (
        <Layout categories={props.collections} navigation={props.navigation} pageTitle={t('verify.title')}>
            <ContentContainer>
                <FormContainer>
                    <FormWrapper column itemsCenter gap="3.5rem">
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
                                <Stack justifyCenter itemsCenter column gap="2rem">
                                    <TP>{t('verify.fail')}</TP>
                                    <Link href="/">{t('home')}</Link>
                                </Stack>
                            </>
                        ) : (
                            <Stack justifyCenter itemsCenter column gap="2rem">
                                <TP>{t('verify.success')}</TP>
                                <Link href="/customer/sign-in">{t('signIn')}</Link>
                            </Stack>
                        )}
                    </FormWrapper>
                </FormContainer>
            </ContentContainer>
        </Layout>
    );
};
