import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Stack } from '@/src/components/atoms/Stack';
import { Link } from '@/src/components/atoms/Link';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Input, Banner } from '@/src/components/forms';
import { Button } from '@/src/components/molecules/Button';
import { useTranslation } from 'next-i18next';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Absolute, Form, FormContainer, FormContent, FormWrapper } from '../components/shared';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { arrayToTree } from '@/src/util/arrayToTree';

type FormValues = {
    emailAddress: string;
};

const ForgotPassword: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('customer');
    const { t: tErrors } = useTranslation('common');

    const schema = z.object({
        emailAddress: z.string().email(tErrors('errors.email.invalid')).min(1, tErrors('errors.email.required')),
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<{ emailAddress: string }> = async data => {
        const { emailAddress } = data;
        try {
            const { requestPasswordReset } = await storefrontApiMutation({
                requestPasswordReset: [
                    { emailAddress },
                    {
                        __typename: true,
                        '...on Success': {
                            success: true,
                        },
                        '...on NativeAuthStrategyError': {
                            errorCode: true,
                            message: true,
                        },
                    },
                ],
            });

            if (!requestPasswordReset) {
                setError('root', { message: tErrors(`errors.backend.UNKNOWN_ERROR`) });
                return;
            }

            if (requestPasswordReset?.__typename === 'Success') {
                //TODO: Add success message and info about email
                return;
            }

            setError('root', { message: tErrors(`errors.backend.${requestPasswordReset.errorCode}`) });
        } catch {
            setError('root', { message: tErrors(`errors.backend.UNKNOWN_ERROR`) });
        }
    };

    return (
        <Layout categories={props.collections} navigation={props.navigation} pageTitle={t('forgotPasswordTitle')}>
            <ContentContainer>
                <FormContainer>
                    <FormWrapper column itemsCenter gap="3.5rem">
                        <Absolute w100>
                            <Banner error={errors.root} clearErrors={() => setError('root', { message: undefined })} />
                        </Absolute>
                        <TP weight={600}>{t('forgotPasswordTitle')}</TP>
                        <FormContent w100 column itemsCenter gap="1.75rem">
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Input
                                    error={errors.emailAddress}
                                    label={t('email')}
                                    type="text"
                                    {...register('emailAddress')}
                                />
                                <Button type="submit">{t('newPassword')}</Button>
                            </Form>
                            <Stack column itemsCenter gap="0.5rem">
                                <Link href="/customer/sign-in">{t('signIn')}</Link>
                                <Link href="/customer/sign-up">{t('signUp')}</Link>
                            </Stack>
                        </FormContent>
                    </FormWrapper>
                </FormContainer>
            </ContentContainer>
        </Layout>
    );
};

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const navigation = arrayToTree(collections);

    const returnedStuff = {
        ...r.props,
        collections,
        navigation,
    };

    return {
        props: returnedStuff,
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
    };
};

export { getStaticPaths, getStaticProps };
export default ForgotPassword;
