import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { Stack } from '@/src/components/atoms/Stack';
import { usePush } from '@/src/lib/redirect';
import { AbsoluteError, Form, FormContent, FormWrapper } from '../components/FormWrapper';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { ErrorBanner } from '@/src/components/forms/ErrorBanner';

type FormValues = { password: string; confirmPassword: string };

const ResetPassword: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { query } = useRouter();
    const token = query?.token;
    const { t } = useTranslation('customer');
    const { t: tErrors } = useTranslation('common');

    const schema = z
        .object({
            password: z
                .string()
                .min(8, tErrors('errors.password.minLength'))
                .max(25, tErrors('errors.password.maxLength')),
            confirmPassword: z
                .string()
                .min(8, tErrors('errors.password.minLength'))
                .max(25, tErrors('errors.password.maxLength')),
        })
        .refine(data => data.password === data.confirmPassword, {
            message: tErrors('errors.confirmPassword.mustMatch'),
            path: ['confirmPassword'],
        });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    const push = usePush();

    const onSubmit: SubmitHandler<FormValues> = async data => {
        if (!token) return;
        try {
            const { resetPassword } = await storefrontApiMutation({
                resetPassword: [
                    { password: data.password, token: token as string },
                    {
                        __typename: true,
                        '...on CurrentUser': {
                            id: true,
                        },
                        '...on NativeAuthStrategyError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on NotVerifiedError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on PasswordResetTokenExpiredError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on PasswordResetTokenInvalidError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on PasswordValidationError': {
                            errorCode: true,
                            message: true,
                            validationErrorMessage: true,
                        },
                    },
                ],
            });

            if (resetPassword.__typename === 'CurrentUser') {
                console.log('success');
                push('/customer/manage');
                return;
            }

            setError('root', { message: tErrors(`errors.backend.${resetPassword.errorCode}`) });
        } catch {
            setError('root', { message: tErrors(`errors.backend.UNKNOWN_ERROR`) });
        }
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack column itemsCenter gap="3.5rem" style={{ minHeight: 'calc(100vh - 6rem)' }}>
                    <AbsoluteError w100>
                        <ErrorBanner error={errors.root} clearErrors={() => setError('root', { message: undefined })} />
                    </AbsoluteError>
                    <TP weight={600}>{t('resetPasswordTitle')}</TP>
                    <FormWrapper column itemsCenter gap="1.75rem">
                        <FormContent w100 column itemsCenter gap="1.75rem">
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Input
                                    error={errors.password}
                                    label={t('newPassword')}
                                    type="password"
                                    {...register('password')}
                                />
                                <Input
                                    error={errors.confirmPassword}
                                    label={t('confirmNewPassword')}
                                    type="password"
                                    {...register('confirmPassword')}
                                />
                                <Button type="submit">{t('resetPassword')}</Button>
                            </Form>
                        </FormContent>
                    </FormWrapper>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'customer'])(context);
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
export default ResetPassword;
