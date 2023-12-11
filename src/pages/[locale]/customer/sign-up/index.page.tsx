import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RegisterCustomerInputType } from '@/src/graphql/selectors';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Link } from '@/src/components/atoms/Link';

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
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="text" {...register('emailAddress')} />
                    <input type="password" {...register('password')} />
                    <button type="submit">Sign Up</button>
                </form>
                <Link href="/customer/forgot-password">Forgot Password?</Link>
                <Link href="/customer/sign-in">Login</Link>
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
