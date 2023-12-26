import { Link } from '@/src/components/atoms/Link';
import { OrderState } from '@/src/components/molecules/OrderState';
import { Price } from '@/src/components/atoms/Price';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { storefrontApiMutation } from '@/src/graphql/client';
import { ActiveCustomerType, ActiveCustomerSelector, ActiveOrderType } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { dateFormatter } from '@/src/util/dateFormatter';

type CustomerDataForm = {
    addressEmail: ActiveCustomerType['emailAddress'];
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
    initialCustomer: ActiveCustomerType & {
        orders: {
            items: ActiveOrderType[];
        };
    };
}

export const CustomerForm: React.FC<Props> = ({ initialCustomer }) => {
    const { t } = useTranslation('customer');
    const [activeCustomer, setActiveCustomer] = useState<Props['initialCustomer']>(initialCustomer);
    const [view, setView] = useState<'details' | 'password'>('details');

    const push = usePush();

    const handleView = (view: 'details' | 'password') => {
        setView(view);
        resetCustomer();
        resetPassword();
    };

    const {
        register: rCustomer,
        handleSubmit: handleCustomerDataChange,
        reset: resetCustomer,
    } = useForm<CustomerDataForm>({
        values: {
            addressEmail: activeCustomer?.emailAddress,
            firstName: activeCustomer?.firstName || '',
            lastName: activeCustomer?.lastName || '',
            phoneNumber: activeCustomer?.phoneNumber,
        },
    });

    const onCustomerDataChange: SubmitHandler<CustomerDataForm> = async input => {
        const { firstName, lastName, phoneNumber } = input;
        const { updateCustomer } = await storefrontApiMutation({
            updateCustomer: [{ input: { firstName, lastName, phoneNumber } }, ActiveCustomerSelector],
        });

        setActiveCustomer(p => ({ ...p, ...updateCustomer }));
    };

    const {
        register: rPassword,
        handleSubmit: handlePasswordChange,
        reset: resetPassword,
    } = useForm<PasswordForm>({
        values: {
            oldPassword: '',
            newPassword: '',
            newPasswordConfirmation: '',
        },
    });

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

    const order = activeCustomer?.orders?.items[0];

    return (
        <Stack w100 gap="3.5rem" column>
            <Stack w100 column gap="1.5rem">
                <TP size="2.5rem" weight={600}>
                    {t('accountPage.title')}
                </TP>
                <Stack gap="0.5rem">
                    <StyledButton active={view === 'details'} onClick={() => handleView('details')}>
                        {t('accountPage.detailsForm.title')}
                    </StyledButton>
                    <StyledButton active={view === 'password'} onClick={() => handleView('password')}>
                        {t('accountPage.passwordForm.title')}
                    </StyledButton>
                </Stack>
            </Stack>
            {view === 'details' ? (
                <CustomerWrap w100 gap="3.5rem">
                    <Form onSubmit={handleCustomerDataChange(onCustomerDataChange)} noValidate>
                        <Stack column itemsCenter>
                            <Input
                                {...rCustomer('addressEmail')}
                                label={t('accountPage.detailsForm.addressEmail')}
                                disabled
                            />
                            <Stack w100 gap="1.25rem">
                                <Input label={t('accountPage.detailsForm.firstName')} {...rCustomer('firstName')} />
                                <Input label={t('accountPage.detailsForm.lastName')} {...rCustomer('lastName')} />
                            </Stack>
                            <Input label={t('accountPage.detailsForm.phoneNumber')} {...rCustomer('phoneNumber')} />
                        </Stack>
                        <StyledButton type="submit">{t('accountPage.detailsForm.changeDetails')}</StyledButton>
                    </Form>
                    {order ? (
                        <LastOrderWrap w100 justifyBetween column gap="1.25rem">
                            <TP size="1.75rem" weight={600}>
                                {t('accountPage.lastOrder.title')}
                            </TP>
                            <Stack gap="1.5rem">
                                <ProductImage size="thumbnail-big" src={order?.lines[0]?.featuredAsset?.preview} />
                                <Stack column gap="0.5rem">
                                    <Stack column>
                                        <TP size="1.5rem" weight={500}>
                                            {t('accountPage.lastOrder.orderNumber')}:&nbsp;
                                        </TP>
                                        <TP>{order.code}</TP>
                                    </Stack>
                                    <OrderState state={order.state} />
                                    <Stack>
                                        <TP size="1.5rem" weight={500}>
                                            {t('accountPage.lastOrder.orderDate')}:&nbsp;
                                        </TP>
                                        <TP>{dateFormatter(order.createdAt, 'date')}</TP>
                                    </Stack>
                                    <Stack>
                                        <TP size="1.5rem" weight={500}>
                                            {t('accountPage.lastOrder.totalQuantity')}:&nbsp;
                                        </TP>
                                        <TP>{order?.totalQuantity}</TP>
                                    </Stack>
                                    <Stack>
                                        <TP size="1.5rem" weight={500}>
                                            {t('accountPage.lastOrder.totalProducts')}:&nbsp;
                                        </TP>
                                        <TP>{order?.lines.length}</TP>
                                    </Stack>
                                    <Stack>
                                        <TP size="1.5rem" weight={500}>
                                            {t('accountPage.lastOrder.totalPrice')}:&nbsp;
                                        </TP>
                                        <Price currencyCode={order?.currencyCode} price={order?.totalWithTax} />
                                    </Stack>
                                </Stack>
                            </Stack>
                            <StyledLink href={`/customer/manage/orders/${order?.code}`}>
                                <StyledButton style={{ width: '100%' }}>
                                    {t('accountPage.lastOrder.viewOrder')}
                                </StyledButton>
                            </StyledLink>
                        </LastOrderWrap>
                    ) : (
                        <Stack>
                            <TP size="1.75rem" weight={600}>
                                {t('accountPage.lastOrder.noOrders')}
                            </TP>
                        </Stack>
                    )}
                </CustomerWrap>
            ) : null}
            {view === 'password' ? (
                <Stack w100>
                    <Form onSubmit={handlePasswordChange(onPasswordChange)}>
                        <Stack column itemsCenter>
                            <Input label="Old password" type="password" {...rPassword('oldPassword')} />
                            <Stack gap="1.25rem">
                                <Input label="New password" type="password" {...rPassword('newPassword')} />
                                <Input
                                    label="New password confirmation"
                                    type="password"
                                    {...rPassword('newPasswordConfirmation')}
                                />
                            </Stack>
                        </Stack>
                        <StyledButton type="submit">{t('accountPage.passwordForm.confirmPassword')}</StyledButton>
                    </Form>
                </Stack>
            ) : null}
        </Stack>
    );
};

const CustomerWrap = styled(Stack)`
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        flex-direction: column;
    }
`;

const StyledButton = styled(Button)<{ active?: boolean }>`
    background: ${p => p.active && p.theme.gray(700)};
    font-size: 1.2rem;
`;

const LastOrderWrap = styled(Stack)``;

const StyledLink = styled(Link)`
    width: 100%;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;
