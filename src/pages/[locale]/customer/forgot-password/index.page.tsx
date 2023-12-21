import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Stack } from '@/src/components/atoms/Stack';
import { Link } from '@/src/components/atoms/Link';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { useTranslation } from 'next-i18next';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Form, FormWrapper } from '../components/FormWrapper';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type FormValues = {
    emailAddress: string;
};

const ForgotPassword: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('customer');

    const schema = z.object({
        emailAddress: z.string().email('Please enter a valid email address'),
    });

    const { register, handleSubmit } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<{ emailAddress: string }> = async data => {
        const { emailAddress } = data;
        const { requestPasswordReset } = await storefrontApiMutation({
            requestPasswordReset: [
                { emailAddress },
                {
                    __typename: true,
                    '...on Success': {
                        success: true,
                    },
                    '...on NativeAuthStrategyError': {
                        errorCode: true,
                        message: true,
                    },
                },
            ],
        });
        console.log(requestPasswordReset);
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack w100 justifyCenter itemsCenter>
                    <FormWrapper column itemsCenter gap="1.75rem">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input label={t('email')} type="text" {...register('emailAddress')} />
                            <Button type="submit">{t('newPassword')}</Button>
                        </Form>
                        <Stack column itemsCenter gap="0.5rem">
                            <Link href="/customer/sign-in">{t('signIn')}</Link>
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
export default ForgotPassword;
