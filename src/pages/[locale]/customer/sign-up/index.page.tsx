import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RegisterCustomerInputType } from '@/src/graphql/selectors';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Link } from '@/src/components/atoms/Link';
import { Stack } from '@/src/components/atoms/Stack';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { useTranslation } from 'next-i18next';
import { Form, FormWrapper } from '../components/FormWrapper';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TP } from '@/src/components/atoms/TypoGraphy';

type FormValues = RegisterCustomerInputType & { confirmPassword: string };

const SignIn: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('customer');
    const { t: tErrors } = useTranslation('common');

    const schema = z
        .object({
            emailAddress: z.string().email(tErrors('errors.email.invalid')).min(1, tErrors('errors.email.required')),
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
        formState: { errors },
        register,
        handleSubmit,
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    console.log(errors);

    const onSubmit: SubmitHandler<FormValues> = async data => {
        const { emailAddress, password } = data;

        try {
            const { registerCustomerAccount } = await storefrontApiMutation({
                registerCustomerAccount: [
                    { input: { emailAddress, password } },
                    {
                        __typename: true,
                        '...on MissingPasswordError': {
                            message: true,
                            errorCode: true,
                        },
                        '...on NativeAuthStrategyError': {
                            message: true,
                            errorCode: true,
                        },
                        '...on PasswordValidationError': {
                            errorCode: true,
                            message: true,
                            validationErrorMessage: true,
                        },
                        '...on Success': {
                            success: true,
                        },
                    },
                ],
            });

            if (registerCustomerAccount.__typename === 'Success') {
                console.log('success');
                return;
            }

            console.log(registerCustomerAccount);
            setError('root', { message: tErrors(`errors.backend.${registerCustomerAccount.errorCode}`) });
        } catch {
            setError('root', { message: tErrors('errors.backend.UNKNOWN_ERROR') });
        }
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack w100 justifyCenter itemsCenter>
                    <FormWrapper column itemsCenter gap="3.5rem">
                        <TP weight={600}>{t('signUpTitle')}</TP>
                        <Stack column itemsCenter gap="1.75rem">
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Input
                                    error={errors.emailAddress}
                                    label={t('email')}
                                    type="text"
                                    {...register('emailAddress')}
                                />
                                <Input
                                    error={errors.password}
                                    label={t('password')}
                                    type="password"
                                    {...register('password')}
                                />
                                <Input
                                    error={errors.confirmPassword}
                                    label={t('confirmPassword')}
                                    type="password"
                                    {...register('confirmPassword')}
                                />
                                <Button type="submit">{t('signUp')}</Button>
                            </Form>
                            <Stack column itemsCenter gap="0.5rem">
                                <Link href="/customer/forgot-password">{t('forgotPassword')}</Link>
                                <Link href="/customer/sign-in">{t('signIn')}</Link>
                            </Stack>
                        </Stack>
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
export default SignIn;
