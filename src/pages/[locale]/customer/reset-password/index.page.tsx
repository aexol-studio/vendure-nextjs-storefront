import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms/Stack';
import { usePush } from '@/src/lib/redirect';

type FormValues = { password: string; confirmPassword: string };

const ResetPassword: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { query } = useRouter();
    const token = query?.token;
    const { register, handleSubmit } = useForm<FormValues>({});
    const push = usePush();

    const onSubmit: SubmitHandler<FormValues> = async data => {
        if (!token) return;
        const { resetPassword } = await storefrontApiMutation({
            resetPassword: [
                { password: data.password, token: token as string },
                {
                    __typename: true,
                    '...on CurrentUser': {
                        id: true,
                    },
                    '...on NativeAuthStrategyError': {
                        errorCode: true,
                        message: true,
                    },
                    '...on NotVerifiedError': {
                        errorCode: true,
                        message: true,
                    },
                    '...on PasswordResetTokenExpiredError': {
                        errorCode: true,
                        message: true,
                    },
                    '...on PasswordResetTokenInvalidError': {
                        errorCode: true,
                        message: true,
                    },
                    '...on PasswordValidationError': {
                        errorCode: true,
                        message: true,
                        validationErrorMessage: true,
                    },
                },
            ],
        });
        console.log(resetPassword);
        if (resetPassword.__typename === 'CurrentUser') push('/customer/sign-in');
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack w100 justifyCenter itemsCenter>
                    <FormWrapper column itemsCenter gap="1.75rem">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input label="New password" type="password" {...register('password')} />
                            <Input label="Confirm new password" type="password" {...register('confirmPassword')} />
                            <Button type="submit">Submit</Button>
                        </Form>
                    </FormWrapper>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const FormWrapper = styled(Stack)`
    padding: 3.75rem 2.5rem;
    border: 1px solid ${({ theme }) => theme.gray(300)};
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: 0 0 0.5rem ${({ theme }) => theme.gray(300)};
`;

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
export default ResetPassword;
