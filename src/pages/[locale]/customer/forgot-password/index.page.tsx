import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Stack } from '@/src/components/atoms/Stack';
import { Link } from '@/src/components/atoms/Link';
import styled from '@emotion/styled';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Input } from '@/src/components/atoms/Input';
import { Button } from '@/src/components/molecules/Button';

const ForgotPassword: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { register, handleSubmit } = useForm<{
        emailAddress: string;
    }>({});

    const onSubmit: SubmitHandler<{ emailAddress: string }> = async data => {
        const { emailAddress } = data;
        console.log(emailAddress);
    };

    return (
        <Layout categories={props.collections}>
            <Stack column itemsCenter>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Input label="Email Address" type="text" {...register('emailAddress')} />
                    <Button type="submit">Generate new password</Button>
                </Form>
                <Link href="/customer/sign-in">Login</Link>
                <Link href="/customer/sign-up">Register</Link>
            </Stack>
        </Layout>
    );
};

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

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
export default ForgotPassword;
