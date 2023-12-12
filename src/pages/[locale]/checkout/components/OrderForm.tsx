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

import { Input } from '../../../../components/molecules/Input';
import { DeliveryMethod } from './DeliveryMethod';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { AnimatePresence } from 'framer-motion';
import { AddressBox } from '../../customer/manage/components/AddressBox';
import { CountrySelector } from '@/src/components/molecules/CountrySelector';

type Form = CreateAddressType &
    CreateCustomerType & {
        deliveryMethod?: string;
    };

interface OrderFormProps {
    availableCountries?: AvailableCountriesType[];
}

export const OrderForm: React.FC<OrderFormProps> = ({ availableCountries }) => {
    const { cart, changeShippingMethod } = useCart();
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
        countryCode: z.string().length(2, { message: t('orderForm.errors.countryCode.required') }),
        streetLine1: z.string().min(1, { message: t('orderForm.errors.streetLine1.required') }),
        city: z.string().min(1, { message: t('orderForm.errors.city.required') }),
        company: z.string().optional(),
        fullName: z.string().min(1, { message: t('orderForm.errors.fullName.required') }),
        phoneNumber: z.string().min(1, { message: t('orderForm.errors.phone.required') }),
        postalCode: z.string().min(1, { message: t('orderForm.errors.postalCode.required') }),
        province: z.string().min(1, { message: t('orderForm.errors.province.required') }),
        streetLine2: z.string().optional(),
        deliveryMethod: z.string().min(1, { message: t('deliveryMethod.errors.required') }),
    });

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        clearErrors,
        watch,
        formState: { errors },
    } = useForm<Form>({
        //TODO: Verify what customer we will use
        values: activeCustomer
            ? {
                  ...activeCustomer?.addresses?.find(address => address.defaultShippingAddress),
                  deliveryMethod: '',
                  countryCode: cart?.billingAddress?.country ?? 'US',
                  streetLine1: activeCustomer?.addresses?.[0]?.streetLine1 ?? '',
                  emailAddress: activeCustomer?.emailAddress,
                  firstName: activeCustomer?.firstName,
                  lastName: activeCustomer?.lastName,
                  phoneNumber: activeCustomer?.phoneNumber,
              }
            : undefined,
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<Form> = async data => {
        const { emailAddress, firstName, lastName, deliveryMethod, ...rest } = data;

        if (deliveryMethod && cart?.shippingLines[0]?.shippingMethod.id !== deliveryMethod) {
            await changeShippingMethod(deliveryMethod);
        }

        const { nextOrderStates } = await storefrontApiQuery({
            nextOrderStates: true,
        });
        console.log(nextOrderStates);
        if (!nextOrderStates.includes('ArrangingPayment')) {
            //TODO: Handle error (no next order state)
            return;
        }

        // Set the shipping address for the order
        const { setOrderShippingAddress } = await storefrontApiMutation({
            setOrderShippingAddress: [
                { input: { ...rest } },
                {
                    __typename: true,
                    '...on Order': ActiveOrderSelector,
                    '...on NoActiveOrderError': { message: true, errorCode: true },
                },
            ],
        });

        if (setOrderShippingAddress?.__typename === 'NoActiveOrderError') {
            //TODO: Handle error
        }

        if (setOrderShippingAddress.__typename === 'Order' && setOrderShippingAddress.state !== 'ArrangingPayment') {
            // Set the customer for the order if there is no customer (it gets automatically set if there is a customer on provided address)
            if (!activeCustomer) {
                const { setCustomerForOrder } = await storefrontApiMutation({
                    setCustomerForOrder: [
                        { input: { emailAddress, firstName, lastName } },
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
    };

    return (
        <Stack column>
            <div ref={errorRef}>
                <AnimatePresence>
                    {errors.root?.message && errors.root.message !== '' ? (
                        <ErrorBanner column gap="2rem">
                            <TP size="1.75rem" weight={600}>
                                Error occurred while sending the form
                            </TP>
                            <TP>{errors.root?.message}</TP>
                            <Button onClick={() => clearErrors()}>Clear errors</Button>
                        </ErrorBanner>
                    ) : null}
                </AnimatePresence>
            </div>
            {activeCustomer?.addresses?.length && activeCustomer.addresses.length > 0 ? (
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Stack column>
                        <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                            {t('orderForm.contactInfo')}
                        </TH2>
                        <TP size="1.5rem" weight={600}>
                            {activeCustomer?.emailAddress}
                        </TP>
                        <TP size="1.5rem" weight={600}>
                            {activeCustomer?.firstName} {activeCustomer?.lastName}
                        </TP>
                        <Stack flexWrap gap="0.5rem" itemsCenter>
                            {activeCustomer.addresses?.map(address => (
                                <AddressBox key={address.id} address={address} />
                            ))}
                        </Stack>
                    </Stack>
                    {shippingMethods && (
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
                    )}
                    <Button type="submit">{t('orderForm.continue-to-payment')}</Button>
                </Form>
            ) : (
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Customer Part */}
                    <Stack column>
                        <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                            {t('orderForm.contactInfo')}
                        </TH2>
                        <Input
                            label={t('orderForm.emailAddress')}
                            {...register('emailAddress')}
                            error={errors.emailAddress}
                        />
                        <Stack gap="1.75rem">
                            <Input
                                label={t('orderForm.firstName')}
                                {...register('firstName')}
                                error={errors.firstName}
                            />
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
                        <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                            {t('orderForm.shippingInfo')}
                        </TH2>
                        <Input label={t('orderForm.fullName')} {...register('fullName')} error={errors.fullName} />
                        <Input label={t('orderForm.company')} {...register('company')} error={errors.company} />
                        <Input
                            label={t('orderForm.streetLine1')}
                            {...register('streetLine1')}
                            error={errors.province}
                        />
                        <Input
                            label={t('orderForm.streetLine2')}
                            {...register('streetLine2')}
                            error={errors.postalCode}
                        />
                        <Stack gap="1.75rem">
                            <Input label={t('orderForm.city')} {...register('city')} error={errors.city} />
                            {availableCountries && (
                                <CountrySelector
                                    {...register('countryCode')}
                                    label={t('orderForm.countryCode')}
                                    //TODO: Verify what country we will use
                                    defaultValue={cart?.billingAddress?.country ?? 'US'}
                                    options={availableCountries}
                                    error={errors.countryCode}
                                />
                            )}
                        </Stack>
                        <Stack gap="1.75rem">
                            <Input label={t('orderForm.province')} {...register('province')} error={errors.province} />
                            <Input
                                label={t('orderForm.postalCode')}
                                {...register('postalCode')}
                                error={errors.postalCode}
                            />
                        </Stack>
                    </Stack>
                    {shippingMethods && (
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
                    )}
                    <Button type="submit">{t('orderForm.continue-to-payment')}</Button>
                </Form>
            )}
        </Stack>
    );
};

const Form = styled.form`
    margin-top: 1.6rem;
`;

const ErrorBanner = styled(Stack)`
    padding: 1.75rem;

    background-color: ${p => `${p.theme.error}90`};
    border-radius: ${p => p.theme.borderRadius};
    border: 1px solid ${p => p.theme.error};
`;
