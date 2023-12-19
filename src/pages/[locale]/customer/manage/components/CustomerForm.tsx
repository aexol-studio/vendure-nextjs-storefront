import { Stack } from '@/src/components/atoms/Stack';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { storefrontApiMutation } from '@/src/graphql/client';
import { ActiveCustomerType, ActiveCustomerSelector } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type CustomerDataForm = {
    firstName: ActiveCustomerType['firstName'];
    lastName: ActiveCustomerType['lastName'];
    phoneNumber: ActiveCustomerType['phoneNumber'];
};

type PasswordForm = {
    oldPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
};

interface Props {
    initialCustomer: ActiveCustomerType;
}

export const CustomerForm: React.FC<Props> = ({ initialCustomer }) => {
    const [activeCustomer, setActiveCustomer] = useState<ActiveCustomerType>(initialCustomer);
    const push = usePush();

    const { register: rCustomer, handleSubmit: handleCustomerDataChange } = useForm<CustomerDataForm>({
        values: {
            firstName: activeCustomer?.firstName || '',
            lastName: activeCustomer?.lastName || '',
            phoneNumber: activeCustomer?.phoneNumber,
        },
    });

    const onCustomerDataChange: SubmitHandler<CustomerDataForm> = async data => {
        const { updateCustomer } = await storefrontApiMutation({
            updateCustomer: [{ input: data }, ActiveCustomerSelector],
        });
        setActiveCustomer(updateCustomer);
    };

    const { register: rPassword, handleSubmit: handlePasswordChange } = useForm<PasswordForm>();
    const onPasswordChange: SubmitHandler<PasswordForm> = async data => {
        const { updateCustomerPassword } = await storefrontApiMutation({
            updateCustomerPassword: [
                { currentPassword: data.oldPassword, newPassword: data.newPassword },
                {
                    __typename: true,
                    '...on InvalidCredentialsError': {
                        message: true,
                        errorCode: true,
                        authenticationError: true,
                    },
                    '...on NativeAuthStrategyError': {
                        errorCode: true,
                        message: true,
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

        if (updateCustomerPassword.__typename === 'Success') {
            const { logout } = await storefrontApiMutation({ logout: { success: true } });
            if (logout.success) push('/customer/sign-in/');
        }
    };

    return (
        <Stack>
            <Form onSubmit={handleCustomerDataChange(onCustomerDataChange)}>
                <Stack column itemsCenter>
                    <Input label="First name" {...rCustomer('firstName')} />
                    <Input label="Last name" {...rCustomer('lastName')} />
                    <Input label="Phone number" {...rCustomer('phoneNumber')} />
                </Stack>
                <Button type="submit">Change data</Button>
            </Form>
            <Form onSubmit={handlePasswordChange(onPasswordChange)}>
                <Stack column itemsCenter>
                    <Input label="Old password" type="password" {...rPassword('oldPassword')} />
                    <Input label="New password" type="password" {...rPassword('newPassword')} />
                    <Input
                        label="New password confirmation"
                        type="password"
                        {...rPassword('newPasswordConfirmation')}
                    />
                </Stack>
                <Button type="submit">Change password</Button>
            </Form>
        </Stack>
    );
};

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;
