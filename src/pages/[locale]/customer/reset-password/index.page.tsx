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
import { Form, FormWrapper } from '../components/FormWrapper';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type FormValues = { password: string; confirmPassword: string };

const ResetPassword: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { query } = useRouter();
    const token = query?.token;
    const { t } = useTranslation('customer');

    const schema = z
        .object({
            password: z.string().min(8, 'Password must be at least 8 characters long'),
            confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
        })
        .refine(data => data.password === data.confirmPassword, {
            message: 'Passwords must match',
            path: ['confirmPassword'],
        });

    const { register, handleSubmit } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    const push = usePush();

    const onSubmit: SubmitHandler<FormValues> = async data => {
        if (!token) return;
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
        console.log(resetPassword);
        if (resetPassword.__typename === 'CurrentUser') push('/customer/sign-in');
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack w100 justifyCenter itemsCenter>
                    <FormWrapper column itemsCenter gap="1.75rem">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input label={t('newPassword')} type="password" {...register('password')} />
                            <Input label={t('confirmNewPassword')} type="password" {...register('confirmPassword')} />
                            <Button type="submit">{t('resetPassword')}</Button>
                        </Form>
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
