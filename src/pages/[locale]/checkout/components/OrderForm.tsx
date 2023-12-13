import React, { useEffect, useState } from 'react';

import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';
import { Button } from '@/src/components/molecules/Button';

import { useCart } from '@/src/state/cart';
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

import { Input } from '../../../../components/forms/Input';
import { DeliveryMethod } from './DeliveryMethod';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { CountrySelect } from '@/src/components/forms/CountrySelect';
import { CheckBox } from '@/src/components/forms/CheckBox';
import { Radio } from '@/src/components/forms/Radio';
import { Building2, User } from 'lucide-react';
import { WhatAccountGives } from './ui/WhatAccountGives';

type Form = CreateCustomerType & {
    deliveryMethod?: string;
    as?: 'company' | 'individual';
    billingDifferentThanShipping?: boolean;
    shipping: CreateAddressType;
    billing: CreateAddressType;
    userNeedInvoice?: boolean;
    NIP?: string;
    createAccount?: boolean;
    password?: string;
    confirmPassword?: string;
};

interface OrderFormProps {
    availableCountries?: AvailableCountriesType[];
}

export const OrderForm: React.FC<OrderFormProps> = ({ availableCountries }) => {
    const { cart, changeShippingMethod } = useCart();

    //TODO: Verify what country we will use
    const countryCode = cart?.billingAddress?.country ?? 'US';

    const { t } = useTranslation('checkout');
    const push = usePush();
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

    const schema = z.object({
        emailAddress: z.string().email(),
        firstName: z.string().min(1, { message: t('orderForm.errors.firstName.required') }),
        lastName: z.string().min(1, { message: t('orderForm.errors.lastName.required') }),
        phoneNumber: z.string().min(1, { message: t('orderForm.errors.phone.required') }),
        deliveryMethod: z.string().min(1, { message: t('deliveryMethod.errors.required') }),
        NIP: z.string().optional(),
        billingDifferentThanShipping: z.boolean().optional(),
        createAccount: z.boolean().optional(),
        //TODO: Add password validation
        password: z.string().optional(),

        shipping: z.object({
            fullName: z.string().min(1, { message: t('orderForm.errors.fullName.required') }),
            streetLine1: z.string().min(1, { message: t('orderForm.errors.streetLine1.required') }),
            streetLine2: z.string().optional(),
            city: z.string().min(1, { message: t('orderForm.errors.city.required') }),
            countryCode: z.string().length(2, { message: t('orderForm.errors.countryCode.required') }),
            province: z.string().min(1, { message: t('orderForm.errors.province.required') }),
            postalCode: z.string().min(1, { message: t('orderForm.errors.postalCode.required') }),
            company: z.string().optional(),
        }),
        billing: z
            .object({
                fullName: z.string().optional(),
                streetLine1: z.string().optional(),
                streetLine2: z.string().optional(),
                city: z.string().optional(),
                countryCode: z.string().optional(),
                province: z.string().optional(),
                postalCode: z.string().optional(),
                company: z.string().optional(),
            })
            .optional(),
    });

    const defaultShippingAddress = activeCustomer?.addresses?.find(address => address.defaultShippingAddress);
    const defaultBillingAddress = activeCustomer?.addresses?.find(address => address.defaultBillingAddress);

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        clearErrors,
        watch,
        formState: { errors },
    } = useForm<Form>({
        defaultValues: {
            as: defaultBillingAddress?.company ? 'company' : 'individual',
            billingDifferentThanShipping:
                JSON.stringify(defaultBillingAddress) !== JSON.stringify(defaultShippingAddress),
            shipping: { countryCode },
            NIP: defaultBillingAddress?.customFields?.NIP ?? '',
            userNeedInvoice: defaultBillingAddress?.customFields?.NIP ? true : false,
        },
        values: activeCustomer
            ? {
                  emailAddress: activeCustomer.emailAddress,
                  firstName: activeCustomer.firstName,
                  lastName: activeCustomer.lastName,
                  phoneNumber: activeCustomer.phoneNumber,
                  NIP: defaultBillingAddress?.customFields?.NIP ?? '',
                  userNeedInvoice: defaultBillingAddress?.customFields?.NIP ? true : false,
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
        NIP,
        billingDifferentThanShipping,
        createAccount,
        password,
    }) => {
        try {
            //TODO: Invoke new zod resolver for billing
            if (deliveryMethod && cart?.shippingLines[0]?.shippingMethod.id !== deliveryMethod) {
                await changeShippingMethod(deliveryMethod);
            }

            const { nextOrderStates } = await storefrontApiQuery({
                nextOrderStates: true,
            });

            if (!nextOrderStates.includes('ArrangingPayment')) {
                //TODO: Handle error (no next order state)
                return;
            }

            // Set the shipping address for the order
            const { setOrderShippingAddress } = await storefrontApiMutation({
                setOrderShippingAddress: [
                    { input: { ...shipping } },
                    {
                        __typename: true,
                        '...on Order': ActiveOrderSelector,
                        '...on NoActiveOrderError': { message: true, errorCode: true },
                    },
                ],
            });

            if (!billingDifferentThanShipping) {
                const { setOrderBillingAddress } = await storefrontApiMutation({
                    setOrderBillingAddress: [
                        { input: { ...shipping, customFields: { NIP } } },
                        {
                            __typename: true,
                            '...on Order': ActiveOrderSelector,
                            '...on NoActiveOrderError': { message: true, errorCode: true },
                        },
                    ],
                });
                console.log(setOrderBillingAddress);
            } else {
                const { setOrderBillingAddress } = await storefrontApiMutation({
                    setOrderBillingAddress: [
                        { input: { ...billing, customFields: { NIP } } },
                        {
                            __typename: true,
                            '...on Order': ActiveOrderSelector,
                            '...on NoActiveOrderError': { message: true, errorCode: true },
                        },
                    ],
                });
                console.log(setOrderBillingAddress);
            }

            if (setOrderShippingAddress?.__typename === 'NoActiveOrderError') {
                //TODO: Handle error
            }

            if (
                setOrderShippingAddress.__typename === 'Order' &&
                setOrderShippingAddress.state !== 'ArrangingPayment'
            ) {
                // Set the customer for the order if there is no customer (it gets automatically set if there is a customer on provided address)
                if (!activeCustomer) {
                    const { setCustomerForOrder } = await storefrontApiMutation({
                        setCustomerForOrder: [
                            { input: { emailAddress, firstName, lastName, phoneNumber } },
                            {
                                __typename: true,
                                '...on Order': ActiveOrderSelector,
                                '...on AlreadyLoggedInError': { message: true, errorCode: true },
                                '...on EmailAddressConflictError': { message: true, errorCode: true },
                                '...on GuestCheckoutError': { message: true, errorCode: true },
                                '...on NoActiveOrderError': { message: true, errorCode: true },
                            },
                        ],
                    });
                    if (setCustomerForOrder?.__typename === 'AlreadyLoggedInError') {
                        //SHOULD NOT HAPPEN *if (!activeCustomer)*
                    }
                    if (setCustomerForOrder?.__typename === 'EmailAddressConflictError') {
                        //Some user have account with this email address but is not logged in
                        setError('emailAddress', { message: t('orderForm.errors.emailAddress.emailAvailable') });
                        if (errors.emailAddress?.ref?.focus) {
                            errors.emailAddress.ref.focus();
                        }
                        return;
                    }
                    if (setCustomerForOrder?.__typename === 'GuestCheckoutError') {
                        //TODO: Handle error
                    }
                    if (setCustomerForOrder?.__typename === 'NoActiveOrderError') {
                        //TODO: Handle error
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

                // After all create account if needed
                if (!activeCustomer && createAccount) {
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

                if (transitionOrderToState?.__typename === 'OrderStateTransitionError') {
                    //TODO: Handle error
                } else if (transitionOrderToState?.__typename === 'Order') {
                    // Redirect to payment page
                    push('/checkout/payment');
                }
            } else {
                //TODO: Handle error
                console.log('Error setting shipping address');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Stack column>
            <Stack ref={errorRef}>
                <AnimatePresence>
                    {errors.root?.message && errors.root.message !== '' ? (
                        <ErrorBanner column gap="2rem">
                            <TP size="1.75rem" weight={600}>
                                {t('orderForm.errors.root.invalid')}
                            </TP>
                            <TP>{errors.root?.message}</TP>
                            <Button onClick={() => clearErrors()}>{t('orderForm.errors.root.closeButton')}</Button>
                        </ErrorBanner>
                    ) : null}
                </AnimatePresence>
            </Stack>

            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Customer Part */}
                <Stack column>
                    <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                        {t('orderForm.contactInfo')}
                    </TH2>
                    <Input
                        {...register('emailAddress')}
                        label={t('orderForm.emailAddress')}
                        error={errors.emailAddress}
                    />
                    <Stack gap="1.75rem">
                        <Input label={t('orderForm.firstName')} {...register('firstName')} error={errors.firstName} />
                        <Input label={t('orderForm.lastName')} {...register('lastName')} error={errors.lastName} />
                    </Stack>
                    <Input
                        type="tel"
                        label={t('orderForm.phone')}
                        {...register('phoneNumber', {
                            onChange: e => (e.target.value = e.target.value.replace(/[^0-9]/g, '')),
                        })}
                        error={errors.phoneNumber}
                    />
                </Stack>

                {/* Shipping Part */}
                <Stack column>
                    <Options gap="1.75rem" itemsCenter>
                        <Radio
                            {...(register('as'),
                            {
                                onChange: e => {
                                    setValue('as', e.target.value as 'company' | 'individual');
                                    setValue('userNeedInvoice', false);
                                    setValue('NIP', '');
                                },
                            })}
                            checked={watch('as') === 'individual'}
                            value="individual"
                            label={t('orderForm.individual')}
                            icon={<User size={20} />}
                        />
                        <Radio
                            {...(register('as'),
                            {
                                onChange: e => {
                                    setValue('as', e.target.value as 'company' | 'individual');
                                    setValue('userNeedInvoice', false);
                                    setValue('NIP', '');
                                },
                            })}
                            checked={watch('as') === 'company'}
                            value="company"
                            label={t('orderForm.company')}
                            icon={<Building2 size={20} />}
                        />
                    </Options>
                    <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                        {t('orderForm.shippingInfo')}
                    </TH2>
                    <Input
                        {...register('shipping.fullName')}
                        label={t('orderForm.fullName')}
                        error={errors.shipping?.fullName}
                    />
                    {watch('as') === 'company' && (
                        <Input
                            {...register('shipping.company')}
                            label={t('orderForm.company')}
                            error={errors.shipping?.company}
                        />
                    )}
                    <Input
                        {...register('shipping.streetLine1')}
                        label={t('orderForm.streetLine1')}
                        error={errors.shipping?.province}
                    />
                    <Input
                        {...register('shipping.streetLine2')}
                        label={t('orderForm.streetLine2')}
                        error={errors.shipping?.postalCode}
                    />
                    <Stack gap="1.75rem">
                        <Input
                            {...register('shipping.city')}
                            label={t('orderForm.city')}
                            error={errors.shipping?.city}
                        />
                        {availableCountries && (
                            <CountrySelect
                                {...register('shipping.countryCode')}
                                label={t('orderForm.countryCode')}
                                defaultValue={countryCode}
                                options={availableCountries}
                                error={errors.shipping?.countryCode}
                            />
                        )}
                    </Stack>
                    <Stack gap="1.75rem">
                        <Input
                            {...register('shipping.province')}
                            label={t('orderForm.province')}
                            error={errors.shipping?.province}
                        />
                        <Input
                            {...register('shipping.postalCode')}
                            label={t('orderForm.postalCode')}
                            error={errors.shipping?.postalCode}
                        />
                    </Stack>
                </Stack>

                <Stack justifyBetween itemsCenter>
                    {watch('as') === 'company' && (
                        <CheckBox
                            {...register('userNeedInvoice', {
                                onChange: e => {
                                    setValue('userNeedInvoice', e.target.checked);
                                    setValue('NIP', '');
                                },
                            })}
                            label={t('orderForm.userNeedInvoice')}
                        />
                    )}
                    <CheckBox
                        {...register('billingDifferentThanShipping')}
                        label={t('orderForm.billingDifferentThanShipping')}
                    />
                </Stack>

                {/* NIP */}
                {watch('as') === 'company' && (
                    <AnimatePresence>
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
                                />
                            </FVInputWrapper>
                        )}
                    </AnimatePresence>
                )}

                {/* Billing Part */}
                {watch('billingDifferentThanShipping') && (
                    <BillingWrapper column>
                        <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                            {t('orderForm.billingInfo')}
                        </TH2>
                        <Input
                            {...register('billing.fullName')}
                            label={t('orderForm.fullName')}
                            error={errors.billing?.fullName}
                        />
                        <Input
                            {...register('billing.company')}
                            label={t('orderForm.company')}
                            error={errors.billing?.company}
                        />
                        <Input
                            {...register('billing.streetLine1')}
                            label={t('orderForm.streetLine1')}
                            error={errors.billing?.province}
                        />
                        <Input
                            {...register('billing.streetLine2')}
                            label={t('orderForm.streetLine2')}
                            error={errors.billing?.postalCode}
                        />
                        <Stack gap="1.75rem">
                            <Input
                                {...register('billing.city')}
                                label={t('orderForm.city')}
                                error={errors.billing?.city}
                            />
                            {availableCountries && (
                                <CountrySelect
                                    {...register('billing.countryCode')}
                                    label={t('orderForm.countryCode')}
                                    defaultValue={countryCode}
                                    options={availableCountries}
                                    error={errors.billing?.countryCode}
                                />
                            )}
                        </Stack>
                        <Stack gap="1.75rem">
                            <Input
                                {...register('billing.province')}
                                label={t('orderForm.province')}
                                error={errors.billing?.province}
                            />
                            <Input
                                {...register('billing.postalCode')}
                                label={t('orderForm.postalCode')}
                                error={errors.billing?.postalCode}
                            />
                        </Stack>
                    </BillingWrapper>
                )}

                {/* Create Account */}
                {!activeCustomer?.id ? (
                    <Stack column gap="1.25rem">
                        <Stack itemsCenter gap="1rem">
                            <CheckBox {...register('createAccount')} label={t('orderForm.createAccount')} />
                            <WhatAccountGives />
                        </Stack>
                        {watch('createAccount') && (
                            <Stack column>
                                <Input
                                    {...register('password')}
                                    type="password"
                                    label={t('orderForm.password')}
                                    error={errors.password}
                                />
                                <Input
                                    {...register('confirmPassword', {
                                        validate: value => value === watch('password'),
                                    })}
                                    type="password"
                                    label={t('orderForm.confirmPassword')}
                                    error={errors.confirmPassword}
                                />
                            </Stack>
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
                            }}
                            shippingMethods={shippingMethods}
                            currencyCode={cart?.currencyCode}
                        />
                    </DeliveryMethodWrapper>
                )}

                {/* Submit */}
                <Button type="submit">{t('orderForm.continueToPayment')}</Button>
            </Form>
        </Stack>
    );
};

const DeliveryMethodWrapper = styled(Stack)`
    margin: 2.4rem 0;
`;

const BillingWrapper = styled(Stack)`
    margin-top: 1.75rem;
`;

const FVInputWrapper = styled(motion.div)`
    margin-top: 1.75rem;
    position: relative;
`;

const Options = styled(Stack)`
    margin: 1.75rem 0;
`;

const Form = styled.form`
    margin-top: 1.6rem;
`;

const ErrorBanner = styled(Stack)`
    padding: 1.75rem;

    background-color: ${p => `${p.theme.error}90`};
    border-radius: ${p => p.theme.borderRadius};
    border: 1px solid ${p => p.theme.error};
`;
