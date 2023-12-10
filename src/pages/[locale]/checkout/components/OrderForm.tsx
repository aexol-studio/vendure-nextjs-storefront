import React, { useEffect, useState } from 'react';

import { TH2 } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';
import { Button } from '@/src/components/molecules/Button';

import { useCart } from '@/src/state/cart';
import { usePush } from '@/src/lib/redirect';

import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import {
    ActiveCustomerSelector,
    CreateAddressType,
    ShippingMethodType,
    ShippingMethodsSelector,
    AvailableCountriesSelector,
    AvailableCountriesType,
    CreateCustomerType,
    ActiveOrderSelector,
} from '@/src/graphql/selectors';

import { Input } from './ui/Input';
import { DeliveryMethod } from './DeliveryMethod';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CountrySelector } from './ui/CountrySelector';
import { useTranslation } from 'next-i18next';

const schema = z.object({
    emailAddress: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),

    countryCode: z.string(),
    streetLine1: z.string(),
    city: z.string(),
    // company: z.string(),
    fullName: z.string(),
    phoneNumber: z.string(),
    postalCode: z.string(),
    province: z.string(),
    streetLine2: z.string(),
});

type Form = CreateAddressType & CreateCustomerType;

export const OrderForm = () => {
    const { t } = useTranslation('checkout');

    const push = usePush();
    const { cart, changeShippingMethod } = useCart();
    const [activeCustomer, setActiveCustomer] = useState<Form>();
    const [shippingMethods, setShippingMethods] = useState<ShippingMethodType[]>();
    const [availableCountries, setAvailableCountries] = useState<AvailableCountriesType[]>();

    useEffect(() => {
        storefrontApiQuery({
            activeCustomer: ActiveCustomerSelector,
        }).then(response => {
            if (response?.activeCustomer?.addresses && response?.activeCustomer?.addresses.length > 0) {
                setActiveCustomer({
                    ...response.activeCustomer.addresses[0],
                    countryCode: response.activeCustomer.addresses[0].country.code,
                    firstName: response.activeCustomer.firstName,
                    lastName: response.activeCustomer.lastName,
                    emailAddress: response.activeCustomer.emailAddress,
                });
            }
        });

        storefrontApiQuery({
            eligibleShippingMethods: ShippingMethodsSelector,
        }).then(response => {
            if (response) {
                if (response.eligibleShippingMethods) {
                    setShippingMethods(response.eligibleShippingMethods);
                }
            }
        });

        storefrontApiQuery({
            availableCountries: AvailableCountriesSelector,
        }).then(response => {
            if (response) {
                if (response.availableCountries) {
                    setAvailableCountries(response.availableCountries);
                }
            }
        });
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Form>({
        defaultValues: { ...activeCustomer },
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<Form> = async data => {
        const { emailAddress, firstName, lastName, ...rest } = data;
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

        if (setCustomerForOrder?.__typename === 'Order' || setCustomerForOrder?.__typename === 'AlreadyLoggedInError') {
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
            if (setOrderShippingAddress?.__typename === 'Order') push('/checkout/payment');
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
                </Stack>

                {/* Shipping Part */}
                <Stack column>
                    <TH2 size="2rem" weight={500} style={{ marginBottom: '1.75rem' }}>
                        {t('orderForm.shippingInfo')}
                    </TH2>
                    <Input label={t('orderForm.contactInfo')} {...register('fullName')} error={errors.fullName} />
                    <Input label={t('orderForm.company')} {...register('company')} error={errors.company} />
                    <Input label={t('orderForm.address')} {...register('streetLine1')} error={errors.province} />
                    <Input
                        label={t('orderForm.streetAddress')}
                        {...register('streetLine2')}
                        error={errors.postalCode}
                    />
                    <Stack gap="1.75rem">
                        <Input label={t('orderForm.city')} {...register('city')} error={errors.city} />
                        {availableCountries && (
                            <CountrySelector
                                {...register('countryCode')}
                                label={t('orderForm.country')}
                                defaultValue={cart?.billingAddress?.country}
                                options={availableCountries}
                                error={errors.countryCode}
                            />
                        )}
                    </Stack>
                    <Stack gap="1.75rem">
                        <Input label={t('orderForm.state')} {...register('province')} error={errors.province} />
                        <Input
                            label={t('orderForm.postalCode')}
                            {...register('postalCode')}
                            error={errors.postalCode}
                        />
                    </Stack>
                    <Input label={t('orderForm.phone')} {...register('phoneNumber')} error={errors.phoneNumber} />
                </Stack>
                {shippingMethods && (
                    <DeliveryMethod
                        changeShippingMethod={changeShippingMethod}
                        shippingMethods={shippingMethods}
                        shippingLines={cart?.shippingLines}
                    />
                )}
                <Button type="submit">{t('orderForm.continue-to-payment')}</Button>
            </form>
        </Stack>
    );
};
