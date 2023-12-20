import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Stack } from '@/src/components/atoms/Stack';
import { Link } from '@/src/components/atoms/Link';
import styled from '@emotion/styled';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { useTranslation } from 'next-i18next';

const ForgotPassword: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('customer');
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
                    <Button type="submit">{t('newPassword')}</Button>
                </Form>
                <Link href="/customer/sign-in">{t('signIn')}</Link>
                <Link href="/customer/sign-up">{t('signUp')}</Link>
            </Stack>
        </Layout>
    );
};

const Form = styled.form`
    display: flex;
    flex-direction: column;
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
export default ForgotPassword;
