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
import { Form, FormWrapper } from '../components/FormWrapper';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const SignIn: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('customer');

    const schema = z.object({
        emailAddress: z.string().email('Please enter a valid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        rememberMe: z.boolean().optional(),
    });

    const { register, handleSubmit } = useForm<LoginCustomerInputType>({
        resolver: zodResolver(schema),
    });
    const push = usePush();
    const onSubmit: SubmitHandler<LoginCustomerInputType> = async data => {
        const { emailAddress, password, rememberMe } = data;

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
        }

        console.log(login);
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack w100 justifyCenter itemsCenter>
                    <FormWrapper column itemsCenter gap="1.75rem">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input label={t('email')} type="text" {...register('emailAddress')} />
                            <Input label={t('password')} type="password" {...register('password')} />
                            <CheckBox label={t('rememberMe')} {...register('rememberMe')} />
                            <Button type="submit">{t('signIn')}</Button>
                        </Form>
                        <Stack column itemsCenter gap="0.5rem">
                            <Link href="/customer/forgot-password">{t('forgotPassword')}</Link>
                            <Link href="/customer/sign-up">{t('signUp')}</Link>
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
