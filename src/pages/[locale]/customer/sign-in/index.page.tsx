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
import styled from '@emotion/styled';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { usePush } from '@/src/lib/redirect';
import { CheckBox } from '@/src/components/forms/CheckBox';
import { useTranslation } from 'next-i18next';

const SignIn: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('customer');
    const { register, handleSubmit } = useForm<LoginCustomerInputType>({});
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

        if (login.__typename === 'CurrentUser') push('/customer/manage');

        console.log(login);
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack column itemsCenter gap="1.75rem">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Input label={t('email')} type="text" {...register('emailAddress')} />
                        <Input label={t('password')} type="password" {...register('password')} />
                        <CheckBox label={t('rememberMe')} {...register('rememberMe')} />
                        <FormButton type="submit">{t('signIn')}</FormButton>
                    </Form>
                    <Link href="/customer/forgot-password">{t('forgotPassword')}</Link>
                    <Link href="/customer/sign-up">{t('signUp')}</Link>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const FormButton = styled(Button)`
    margin-top: 1.2rem;
`;

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
