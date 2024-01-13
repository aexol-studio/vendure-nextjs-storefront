import { Layout } from '@/src/layouts';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { SubmitHandler, useForm } from 'react-hook-form';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Input, Banner } from '@/src/components/forms';
import { Button } from '@/src/components/molecules/Button';
import { usePush } from '@/src/lib/redirect';
import { Absolute, Form, FormContainer, FormContent, FormWrapper } from '../components/shared';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { getServerSideProps } from './props';
import { useChannels } from '@/src/state/channels';

type FormValues = { password: string; confirmPassword: string };

export const ResetPasswordPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const ctx = useChannels();
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
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    const push = usePush();

    const onSubmit: SubmitHandler<FormValues> = async data => {
        try {
            const { resetPassword } = await storefrontApiMutation(ctx)({
                resetPassword: [
                    { password: data.password, token: props.token as string },
                    {
                        __typename: true,
                        '...on CurrentUser': { id: true },
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
                push('/customer/sign-in');
                return;
            }

            setError('root', { message: tErrors(`errors.backend.${resetPassword.errorCode}`) });
        } catch {
            setError('root', { message: tErrors(`errors.backend.UNKNOWN_ERROR`) });
        }
    };

    return (
        <Layout categories={props.collections} navigation={props.navigation} pageTitle={t('resetPasswordTitle')}>
            <ContentContainer>
                <FormContainer>
                    <Absolute w100>
                        <Banner error={errors.root} clearErrors={() => setError('root', { message: undefined })} />
                    </Absolute>
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
                                <Button loading={isSubmitting} type="submit">
                                    {t('resetPassword')}
                                </Button>
                            </Form>
                        </FormContent>
                    </FormWrapper>
                </FormContainer>
            </ContentContainer>
        </Layout>
    );
};
