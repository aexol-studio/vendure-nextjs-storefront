import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginCustomerInputType } from '@/src/graphql/selectors';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Link } from '@/src/components/atoms/Link';

const SignIn: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { register, handleSubmit } = useForm<LoginCustomerInputType>({});

    const onSubmit: SubmitHandler<LoginCustomerInputType> = async data => {
        const { emailAddress, password, rememberMe } = data;

        const { login } = await storefrontApiMutation({
            login: [
                { password, username: emailAddress, rememberMe },
                {
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

        console.log(login);
    };

    return (
        <Layout categories={props.collections}>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="text" {...register('emailAddress')} />
                    <input type="password" {...register('password')} />
                    <button type="submit">Sign In</button>
                </form>
                <Link href="/customer/forgot-password">Forgot Password?</Link>
                <Link href="/customer/sign-up">Create Account</Link>
            </div>
        </Layout>
    );
};

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
