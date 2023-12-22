import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginCustomerInputType } from '@/src/graphql/selectors';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Link } from '@/src/components/atoms/Link';
import { Stack } from '@/src/components/atoms/Stack';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { usePush } from '@/src/lib/redirect';
import { CheckBox } from '@/src/components/forms/CheckBox';
import { useTranslation } from 'next-i18next';
import { AbsoluteError, Form, FormContent, FormWrapper } from '../components/FormWrapper';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { ErrorBanner } from '@/src/components/forms/ErrorBanner';

const SignIn: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('customer');
    const { t: tErrors } = useTranslation('common');

    const schema = z.object({
        emailAddress: z.string().email(tErrors('errors.email.invalid')).min(1, tErrors('errors.email.required')),
        password: z.string().min(8, tErrors('errors.password.minLength')).max(25, tErrors('errors.password.maxLength')),
        rememberMe: z.boolean().optional(),
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginCustomerInputType>({
        resolver: zodResolver(schema),
    });
    const push = usePush();
    const onSubmit: SubmitHandler<LoginCustomerInputType> = async data => {
        const { emailAddress, password, rememberMe } = data;
        try {
            const { login } = await storefrontApiMutation({
                login: [
                    { password, username: emailAddress, rememberMe },
                    {
                        __typename: true,
                        '...on InvalidCredentialsError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on CurrentUser': {
                            id: true,
                            identifier: true,
                        },
                        '...on NativeAuthStrategyError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on NotVerifiedError': {
                            errorCode: true,
                            message: true,
                        },
                    },
                ],
            });

            if (login.__typename === 'CurrentUser') {
                push('/customer/manage');
                return;
            }

            setError('root', { message: tErrors(`errors.backend.${login.errorCode}`) });
        } catch {
            setError('root', { message: tErrors('errors.backend.UNKNOWN_ERROR') });
        }
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack column gap="3.5rem" w100 justifyCenter itemsCenter style={{ minHeight: 'calc(100vh - 6rem)' }}>
                    <FormWrapper column itemsCenter gap="3.5rem">
                        <AbsoluteError w100>
                            <ErrorBanner
                                error={errors.root}
                                clearErrors={() => setError('root', { message: undefined })}
                            />
                        </AbsoluteError>
                        <TP weight={600}>{t('signInTitle')}</TP>
                        <FormContent w100 column itemsCenter gap="1.75rem">
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
                                <CheckBox label={t('rememberMe')} {...register('rememberMe')} />
                                <Button type="submit">{t('signIn')}</Button>
                            </Form>
                            <Stack column itemsCenter gap="0.5rem">
                                <Link href="/customer/forgot-password">{t('forgotPassword')}</Link>
                                <Link href="/customer/sign-up">{t('signUp')}</Link>
                            </Stack>
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
export default SignIn;
