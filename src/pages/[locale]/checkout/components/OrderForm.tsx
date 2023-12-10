import React, { useEffect, useState } from 'react';

import { TH2 } from '@/src/components/atoms/TypoGraphy';
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
} from '@/src/graphql/selectors';

import { Input } from './ui/Input';
import { DeliveryMethod } from './DeliveryMethod';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CountrySelector } from './ui/CountrySelector';
import { useTranslation } from 'next-i18next';

type Form = CreateAddressType & CreateCustomerType;

interface OrderFormProps {
    availableCountries?: AvailableCountriesType[];
}

export const OrderForm: React.FC<OrderFormProps> = ({ availableCountries }) => {
    const { cart, changeShippingMethod } = useCart();
    const { t } = useTranslation('checkout');
    const push = usePush();
    const [activeCustomer, setActiveCustomer] = useState<Form>();
    const [shippingMethods, setShippingMethods] = useState<ShippingMethodType[]>();

    useEffect(() => {
        Promise.all([
            storefrontApiQuery({
                activeCustomer: ActiveCustomerSelector,
            }),
            storefrontApiQuery({
                eligibleShippingMethods: ShippingMethodsSelector,
            }),
        ]).then(([activeCustomer, eligibleShippingMethods]) => {
            if (activeCustomer?.activeCustomer?.addresses && activeCustomer?.activeCustomer?.addresses.length > 0) {
                setActiveCustomer({
                    ...activeCustomer.activeCustomer.addresses[0],
                    countryCode: activeCustomer.activeCustomer.addresses[0].country.code,
                    firstName: activeCustomer.activeCustomer.firstName,
                    lastName: activeCustomer.activeCustomer.lastName,
                    emailAddress: activeCustomer.activeCustomer.emailAddress,
                });
            }
            if (eligibleShippingMethods?.eligibleShippingMethods) {
                setShippingMethods(eligibleShippingMethods.eligibleShippingMethods);
            }
        });
    }, []);

    const schema = z.object({
        emailAddress: z.string().email(),
        firstName: z.string().min(1, { message: t('orderForm.errors.firstName') }),
        lastName: z.string().min(1, { message: t('orderForm.errors.lastName') }),
        countryCode: z.string().length(2, { message: t('orderForm.errors.countryCode') }),
        streetLine1: z.string().min(1, { message: t('orderForm.errors.streetLine1') }),
        city: z.string().min(1, { message: t('orderForm.errors.city') }),
        company: z.string().optional(),
        fullName: z.string().min(1, { message: t('orderForm.errors.fullName') }),
        phoneNumber: z.string().min(1, { message: t('orderForm.errors.phone') }),
        postalCode: z.string().min(1, { message: t('orderForm.errors.postalCode') }),
        province: z.string().min(1, { message: t('orderForm.errors.province') }),
        streetLine2: z.string().optional(),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Form>({
        //TODO: Verify what customer we will use
        defaultValues: { ...cart?.customer, ...activeCustomer },
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<Form> = async data => {
        const { emailAddress, firstName, lastName, ...rest } = data;
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
        if (setOrderShippingAddress?.__typename === 'Order' && setOrderShippingAddress?.state !== 'ArrangingPayment') {
            // Set the customer for the order if there is no customer (it gets automatically set if there is a customer on provided address)
            if (!setOrderShippingAddress.customer) {
                await storefrontApiMutation({
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

            if (transitionOrderToState?.__typename === 'Order') {
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
            <form onSubmit={handleSubmit(onSubmit)}>
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
                    <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                        {t('orderForm.shippingInfo')}
                    </TH2>
                    <Input label={t('orderForm.fullName')} {...register('fullName')} error={errors.fullName} />
                    <Input label={t('orderForm.company')} {...register('company')} error={errors.company} />
                    <Input label={t('orderForm.streetLine1')} {...register('streetLine1')} error={errors.province} />
                    <Input label={t('orderForm.streetLine2')} {...register('streetLine2')} error={errors.postalCode} />
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
                        onChange={changeShippingMethod}
                        shippingMethods={shippingMethods}
                        shippingLines={cart?.shippingLines}
                        currencyCode={cart?.currencyCode}
                    />
                )}
                <Button type="submit">{t('orderForm.continue-to-payment')}</Button>
            </form>
        </Stack>
    );
};
