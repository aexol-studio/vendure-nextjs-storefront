import React, { useEffect, useState } from 'react';

import { TH2 } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';
import { Button } from '@/src/components/molecules/Button';

import { usePush } from '@/src/lib/redirect';

import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import {
    CreateAddressType,
    ShippingMethodType,
    AvailableCountriesType,
    CreateCustomerType,
    ActiveOrderSelector,
    ActiveCustomerSelector,
    ShippingMethodsSelector,
    ActiveCustomerType,
} from '@/src/graphql/selectors';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Trans, useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { CountrySelect } from '@/src/components/forms/CountrySelect';
import { CheckBox } from '@/src/components/forms/CheckBox';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/src/components/forms/Input';
import { WhatAccountGives } from '../ui/WhatAccountGives';
import { DeliveryMethod } from '../DeliveryMethod';
import { useValidationSchema } from './useValidationSchema';
import { FormError } from '@/src/components/forms/atoms';
import { Link } from '@/src/components/atoms/Link';
import { useCheckout } from '@/src/state/checkout';
import { MoveLeft } from 'lucide-react';
import { ErrorBanner } from '@/src/components/forms/ErrorBanner';

type Form = CreateCustomerType & {
    deliveryMethod?: string;
    shippingDifferentThanBilling?: boolean;
    shipping: CreateAddressType;
    billing: CreateAddressType;
    // userNeedInvoice?: boolean;
    // NIP?: string;
    createAccount?: boolean;
    password?: string;
    confirmPassword?: string;
    regulations?: boolean;
    terms?: boolean;
};

interface OrderFormProps {
    availableCountries?: AvailableCountriesType[];
}

export const OrderForm: React.FC<OrderFormProps> = ({ availableCountries }) => {
    const { activeOrder, changeShippingMethod } = useCheckout();

    const { t } = useTranslation('checkout');
    const { t: tErrors } = useTranslation('common');
    const push = usePush();
    const schema = useValidationSchema();

    const [activeCustomer, setActiveCustomer] = useState<ActiveCustomerType>();
    const [shippingMethods, setShippingMethods] = useState<ShippingMethodType[]>();
    const errorRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        Promise.all([
            storefrontApiQuery({ activeCustomer: ActiveCustomerSelector }),
            storefrontApiQuery({ eligibleShippingMethods: ShippingMethodsSelector }),
        ]).then(([{ activeCustomer }, { eligibleShippingMethods }]) => {
            if (activeCustomer) setActiveCustomer(activeCustomer);
            if (eligibleShippingMethods) setShippingMethods(eligibleShippingMethods);
        });
    }, []);

    const defaultShippingAddress = activeCustomer?.addresses?.find(address => address.defaultShippingAddress);
    const defaultBillingAddress = activeCustomer?.addresses?.find(address => address.defaultBillingAddress);

    //TODO: Verify what country we will use
    const countryCode =
        defaultBillingAddress?.country.code ??
        defaultShippingAddress?.country.code ??
        availableCountries?.find(country => country.name === 'Poland')?.code ??
        'PL';

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        clearErrors,
        watch,
        setFocus,
        formState: { errors },
    } = useForm<Form>({
        delayError: 100,
        defaultValues: {
            shippingDifferentThanBilling: defaultShippingAddress
                ? JSON.stringify(defaultBillingAddress) !== JSON.stringify(defaultShippingAddress)
                : false,
            billing: { countryCode },
            // NIP: defaultBillingAddress?.customFields?.NIP ?? '',
            // userNeedInvoice: defaultBillingAddress?.customFields?.NIP ? true : false,
        },
        values: activeCustomer
            ? {
                  createAccount: false,
                  emailAddress: activeCustomer.emailAddress,
                  firstName: activeCustomer.firstName,
                  lastName: activeCustomer.lastName,
                  phoneNumber: activeCustomer.phoneNumber,
                  //   NIP: defaultBillingAddress?.customFields?.NIP ?? '',
                  //   userNeedInvoice: defaultBillingAddress?.customFields?.NIP ? true : false,
                  shippingDifferentThanBilling: defaultShippingAddress
                      ? JSON.stringify(defaultBillingAddress) !== JSON.stringify(defaultShippingAddress)
                      : false,
                  shipping: {
                      ...defaultShippingAddress,
                      streetLine1: defaultShippingAddress?.streetLine1 ?? '',
                      countryCode,
                  },
                  billing: {
                      ...defaultBillingAddress,
                      streetLine1: defaultBillingAddress?.streetLine1 ?? '',
                      countryCode,
                  },
              }
            : undefined,
        resolver: zodResolver(schema),
    });

    console.log(errors);
    const onSubmit: SubmitHandler<Form> = async ({
        emailAddress,
        firstName,
        lastName,
        deliveryMethod,
        billing,
        shipping,
        phoneNumber,
        // NIP,
        shippingDifferentThanBilling,
        createAccount,
        password,
    }) => {
        try {
            if (deliveryMethod && activeOrder?.shippingLines[0]?.shippingMethod.id !== deliveryMethod) {
                await changeShippingMethod(deliveryMethod);
            }

            const { nextOrderStates } = await storefrontApiQuery({
                nextOrderStates: true,
            });

            if (!nextOrderStates.includes('ArrangingPayment')) {
                //TODO: Handle error (no next order state)
                return;
            }

            // Set the billing address for the order
            const { setOrderBillingAddress } = await storefrontApiMutation({
                setOrderBillingAddress: [
                    {
                        input: {
                            ...billing,
                            defaultBillingAddress: false,
                            defaultShippingAddress: false,
                            // customFields: { NIP }
                        },
                    },
                    {
                        __typename: true,
                        '...on Order': { id: true },
                        '...on NoActiveOrderError': { message: true, errorCode: true },
                    },
                ],
            });

            if (setOrderBillingAddress?.__typename !== 'Order') {
                setError('root', { message: tErrors(`errors.backend.${setOrderBillingAddress.errorCode}`) });
                return;
            }

            // Set the shipping address for the order
            if (shippingDifferentThanBilling) {
                // Set the shipping address for the order if it is different than billing
                const { setOrderShippingAddress } = await storefrontApiMutation({
                    setOrderShippingAddress: [
                        { input: { ...shipping, defaultBillingAddress: false, defaultShippingAddress: false } },
                        {
                            __typename: true,
                            '...on Order': { id: true },
                            '...on NoActiveOrderError': { message: true, errorCode: true },
                        },
                    ],
                });

                if (setOrderShippingAddress?.__typename === 'NoActiveOrderError') {
                    setError('root', { message: tErrors(`errors.backend.NO_ACTIVE_ORDER_ERROR`) });
                    return;
                }
            } else {
                // Set the billing address for the order if it is the same as shipping
                const { setOrderShippingAddress } = await storefrontApiMutation({
                    setOrderShippingAddress: [
                        { input: { ...billing, defaultBillingAddress: false, defaultShippingAddress: false } },
                        {
                            __typename: true,
                            '...on Order': { id: true },
                            '...on NoActiveOrderError': { message: true, errorCode: true },
                        },
                    ],
                });

                if (setOrderShippingAddress?.__typename === 'NoActiveOrderError') {
                    setError('root', { message: tErrors(`errors.backend.NO_ACTIVE_ORDER_ERROR`) });
                    return;
                }
            }

            if (!activeCustomer) {
                const { setCustomerForOrder } = await storefrontApiMutation({
                    setCustomerForOrder: [
                        { input: { emailAddress, firstName, lastName, phoneNumber } },
                        {
                            __typename: true,
                            '...on Order': { id: true },
                            '...on AlreadyLoggedInError': { message: true, errorCode: true },
                            '...on EmailAddressConflictError': { message: true, errorCode: true },
                            '...on GuestCheckoutError': { message: true, errorCode: true },
                            '...on NoActiveOrderError': { message: true, errorCode: true },
                        },
                    ],
                });

                if (setCustomerForOrder?.__typename !== 'Order') {
                    if (setCustomerForOrder.__typename === 'EmailAddressConflictError') {
                        setError('emailAddress', {
                            message: tErrors(`errors.backend.${setCustomerForOrder.errorCode}`),
                        });
                        setFocus('emailAddress');
                    } else {
                        setError('root', { message: tErrors(`errors.backend.${setCustomerForOrder.errorCode}`) });
                    }
                    return;
                }
            }

            // Set the order state to ArrangingPayment
            const { transitionOrderToState } = await storefrontApiMutation({
                transitionOrderToState: [
                    { state: 'ArrangingPayment' },
                    {
                        __typename: true,
                        '...on Order': ActiveOrderSelector,
                        '...on OrderStateTransitionError': {
                            errorCode: true,
                            message: true,
                            fromState: true,
                            toState: true,
                            transitionError: true,
                        },
                    },
                ],
            });

            // After all create account if needed and password is provided
            if (!activeCustomer && createAccount && password) {
                await storefrontApiMutation({
                    registerCustomerAccount: [
                        { input: { emailAddress, firstName, lastName, phoneNumber, password } },
                        {
                            __typename: true,
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
            }

            if (!transitionOrderToState) {
                setError('root', { message: tErrors(`errors.backend.UNKNOWN_ERROR`) });
                return;
            }

            if (transitionOrderToState?.__typename !== 'Order') {
                setError('root', { message: tErrors(`errors.backend.${transitionOrderToState.errorCode}`) });
                return;
            }
            // Redirect to payment page
            push('/checkout/payment');
        } catch (error) {
            setError('root', { message: tErrors(`errors.backend.UNKNOWN_ERROR`) });
        }
    };

    return activeOrder?.totalQuantity === 0 ? (
        <Stack w100 column>
            <Stack column gap="2rem">
                <TH2 size="2rem" weight={500}>
                    {t('orderForm.emptyCart')}
                </TH2>
                <EmptyCartDescription>
                    <Trans i18nKey="orderForm.emptyCartDescription" t={t} components={{ 1: <Link href="/"></Link> }} />
                </EmptyCartDescription>
            </Stack>
        </Stack>
    ) : (
        <Stack w100 column>
            <ErrorBanner ref={errorRef} clearErrors={() => clearErrors('root')} error={errors?.root} />
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Customer Part */}
                <Stack column gap="0.5rem">
                    <Stack column gap="2rem">
                        <Stack gap="0.75rem" itemsCenter>
                            <BackButton href="/">
                                <MoveLeft size={24} />
                            </BackButton>
                            <TH2 size="2rem" weight={500}>
                                {t('orderForm.contactInfo')}
                            </TH2>
                        </Stack>
                        <Stack w100 column>
                            <Input
                                {...register('emailAddress')}
                                label={t('orderForm.emailAddress')}
                                error={errors.emailAddress}
                                required
                                disabled={activeCustomer?.id ? true : false}
                            />
                            <Stack w100 gap="1.75rem">
                                <Input
                                    {...register('firstName')}
                                    label={t('orderForm.firstName')}
                                    error={errors.firstName}
                                    required
                                />
                                <Input
                                    {...register('lastName')}
                                    label={t('orderForm.lastName')}
                                    error={errors.lastName}
                                    required
                                />
                            </Stack>
                            <Input
                                {...register('phoneNumber', {
                                    onChange: e => (e.target.value = e.target.value.replace(/[^0-9]/g, '')),
                                })}
                                type="tel"
                                label={t('orderForm.phone')}
                                error={errors.phoneNumber}
                            />
                        </Stack>
                    </Stack>

                    {/* Shipping Part */}
                    <BillingWrapper column>
                        <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                            {t('orderForm.billingInfo')}
                        </TH2>
                        <Input
                            {...register('billing.fullName')}
                            label={t('orderForm.fullName')}
                            error={errors.billing?.fullName}
                            required
                        />
                        <Input
                            {...register('billing.company')}
                            label={t('orderForm.company')}
                            error={errors.billing?.company}
                        />
                        <Input
                            {...register('billing.streetLine1')}
                            label={t('orderForm.streetLine1')}
                            error={errors.billing?.streetLine1}
                            required
                        />
                        <Input
                            {...register('billing.streetLine2')}
                            label={t('orderForm.streetLine2')}
                            error={errors.billing?.streetLine2}
                        />
                        <Stack gap="1.75rem">
                            <Input
                                {...register('billing.city')}
                                label={t('orderForm.city')}
                                error={errors.billing?.city}
                                required
                            />
                            {availableCountries && (
                                <CountrySelect
                                    {...register('billing.countryCode')}
                                    label={t('orderForm.countryCode')}
                                    defaultValue={countryCode}
                                    options={availableCountries}
                                    error={errors.billing?.countryCode}
                                    required
                                />
                            )}
                        </Stack>
                        <Stack gap="1.75rem">
                            <Input
                                {...register('billing.province')}
                                label={t('orderForm.province')}
                                error={errors.billing?.province}
                                required
                            />
                            <Input
                                {...register('billing.postalCode')}
                                label={t('orderForm.postalCode')}
                                error={errors.billing?.postalCode}
                                required
                            />
                        </Stack>
                    </BillingWrapper>
                </Stack>

                <Stack justifyBetween itemsCenter>
                    {/* <CheckBox
                        {...register('userNeedInvoice', {
                            onChange: e => {
                                setValue('userNeedInvoice', e.target.checked);
                                setValue('NIP', '');
                            },
                        })}
                        label={t('orderForm.userNeedInvoice')}
                    /> */}
                    <CheckBox
                        {...register('shippingDifferentThanBilling')}
                        checked={watch('shippingDifferentThanBilling')}
                        label={t('orderForm.shippingDifferentThanBilling')}
                    />
                </Stack>

                {/* NIP */}
                {/* <AnimatePresence>
                    {watch('userNeedInvoice') && (
                        <FVInputWrapper
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}>
                            <Input
                                {...register('NIP')}
                                label={t('orderForm.NIP')}
                                error={errors.NIP}
                                placeholder="NIP"
                                required
                            />
                        </FVInputWrapper>
                    )}
                </AnimatePresence> */}

                {/* Billing Part */}
                <AnimatePresence>
                    {watch('shippingDifferentThanBilling') && (
                        <ShippingWrapper
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}>
                            <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                                {t('orderForm.shippingInfo')}
                            </TH2>
                            <Stack column>
                                <Input
                                    {...register('shipping.fullName')}
                                    label={t('orderForm.fullName')}
                                    error={errors.shipping?.fullName}
                                    required
                                />
                                <Input
                                    {...register('shipping.company')}
                                    label={t('orderForm.company')}
                                    error={errors.shipping?.company}
                                />
                                <Input
                                    {...register('shipping.streetLine1')}
                                    label={t('orderForm.streetLine1')}
                                    error={errors.shipping?.province}
                                    required
                                />
                                <Input
                                    {...register('shipping.streetLine2')}
                                    label={t('orderForm.streetLine2')}
                                    error={errors.shipping?.postalCode}
                                    required
                                />
                                <Stack gap="1.75rem">
                                    <Input
                                        {...register('shipping.city')}
                                        label={t('orderForm.city')}
                                        error={errors.shipping?.city}
                                        required
                                    />
                                    {availableCountries && (
                                        <CountrySelect
                                            {...register('shipping.countryCode')}
                                            label={t('orderForm.countryCode')}
                                            defaultValue={countryCode}
                                            options={availableCountries}
                                            error={errors.shipping?.countryCode}
                                            required
                                        />
                                    )}
                                </Stack>
                                <Stack gap="1.75rem">
                                    <Input
                                        {...register('shipping.province')}
                                        label={t('orderForm.province')}
                                        error={errors.shipping?.province}
                                        required
                                    />
                                    <Input
                                        {...register('shipping.postalCode')}
                                        label={t('orderForm.postalCode')}
                                        error={errors.shipping?.postalCode}
                                        required
                                    />
                                </Stack>
                            </Stack>
                        </ShippingWrapper>
                    )}
                </AnimatePresence>

                {/* Create Account */}
                {!activeCustomer?.id ? (
                    <Stack column gap="1.25rem">
                        <Stack itemsCenter gap="1rem">
                            <CheckBox {...register('createAccount')} label={t('orderForm.createAccount')} />
                            <WhatAccountGives />
                        </Stack>
                        {watch('createAccount') && (
                            <CreateAccountWrapper
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}>
                                <Input
                                    {...register('password')}
                                    type="password"
                                    label={t('orderForm.password')}
                                    error={errors.password}
                                    required
                                />
                                <Input
                                    {...register('confirmPassword')}
                                    type="password"
                                    label={t('orderForm.confirmPassword')}
                                    error={errors.confirmPassword}
                                    required
                                />
                            </CreateAccountWrapper>
                        )}
                    </Stack>
                ) : null}

                {/* Shipping Methods */}
                {shippingMethods && (
                    <DeliveryMethodWrapper>
                        <DeliveryMethod
                            selected={watch('deliveryMethod')}
                            error={errors.deliveryMethod?.message}
                            onChange={async id => {
                                await changeShippingMethod(id);
                                setValue('deliveryMethod', id);
                                clearErrors('deliveryMethod');
                            }}
                            shippingMethods={shippingMethods}
                            currencyCode={activeOrder?.currencyCode}
                            required
                        />
                    </DeliveryMethodWrapper>
                )}

                {/* Submit */}
                <Stack w100 justifyBetween itemsEnd gap="3rem">
                    <Stack itemsStart column>
                        <CheckBox
                            {...register('regulations')}
                            // error={errors.regulations}
                            label={
                                <Trans
                                    i18nKey="orderForm.regulations"
                                    t={t}
                                    components={{ 1: <Link href="/regulations"></Link> }}
                                />
                            }
                            required
                        />
                        <CheckBox
                            {...register('terms')}
                            // error={errors.terms}
                            label={
                                <Trans
                                    i18nKey="orderForm.terms"
                                    t={t}
                                    components={{ 1: <Link href="/terms"></Link> }}
                                />
                            }
                            required
                        />
                    </Stack>
                    <ButtonDesktop type="submit">{t('orderForm.continueToPayment')}</ButtonDesktop>
                </Stack>
                <Stack column>
                    <AnimatePresence>
                        {errors.terms?.message && (
                            <FormError
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}>
                                {errors.terms?.message}
                            </FormError>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {errors.regulations?.message && (
                            <FormError
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}>
                                {errors.regulations?.message}
                            </FormError>
                        )}
                    </AnimatePresence>
                </Stack>
                <Stack w100 justifyEnd>
                    <ButtonMobile type="submit">{t('orderForm.continueToPayment')}</ButtonMobile>
                </Stack>
            </Form>
        </Stack>
    );
};

const ButtonDesktop = styled(Button)`
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        display: none;
    }
`;
const ButtonMobile = styled(Button)`
    margin-top: 1.75rem;
    padding: 1.75rem 2rem;
    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
        display: none;
    }
`;

const BackButton = styled(Link)`
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.2rem;
    height: 3.2rem;

    color: ${({ theme }) => theme.gray(1000)};

    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        display: none;
    }
`;

const EmptyCartDescription = styled.div`
    font-size: 1.75rem;

    & > a {
        font-weight: 500;
        font-size: 1.75rem;
        color: ${p => p.theme.accent(800)};
        text-decoration: underline;
    }
`;

const DeliveryMethodWrapper = styled(Stack)`
    margin: 2.4rem 0;
`;

const BillingWrapper = styled(Stack)`
    margin-top: 1.75rem;
`;

const CreateAccountWrapper = styled(motion.div)`
    display: flex;
    gap: 1.25rem;
`;

const ShippingWrapper = styled(motion.div)`
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    margin-top: 1.75rem;
`;

// const FVInputWrapper = styled(motion.div)`
//     margin-top: 1.75rem;
//     position: relative;
// `;

const Form = styled.form`
    margin-top: 1.6rem;
`;
