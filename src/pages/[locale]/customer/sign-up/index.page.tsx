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
import styled from '@emotion/styled';
import { Input } from '@/src/components/atoms/Input';
import { Button } from '@/src/components/molecules/Button';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';

const SignIn: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { register, handleSubmit } = useForm<RegisterCustomerInputType>({});

    const onSubmit: SubmitHandler<RegisterCustomerInputType> = async data => {
        const { emailAddress, password } = data;

        const { registerCustomerAccount } = await storefrontApiMutation({
            registerCustomerAccount: [
                { input: { emailAddress, password } },
                {
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

        console.log(registerCustomerAccount);
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Wrapper column itemsCenter gap="1.75rem">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Input label="Email Address" type="text" {...register('emailAddress')} />
                        <Input label="Password" type="password" {...register('password')} />
                        <Button type="submit">Sign Up</Button>
                    </Form>
                    <Link href="/customer/forgot-password">Forgot Password?</Link>
                    <Link href="/customer/sign-in">Login</Link>
                </Wrapper>
            </ContentContainer>
        </Layout>
    );
};

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const Wrapper = styled(Stack)``;

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'checkout'])(context);
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
