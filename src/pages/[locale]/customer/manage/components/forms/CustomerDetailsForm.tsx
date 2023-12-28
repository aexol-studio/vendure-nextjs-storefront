import { Stack } from '@/src/components/atoms/Stack';
import { Input } from '@/src/components/forms/Input';
import { storefrontApiMutation } from '@/src/graphql/client';
import { ActiveCustomerSelector, ActiveCustomerType, ActiveOrderType } from '@/src/graphql/selectors';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CustomerLastOrder } from '../atoms/CustomerLastOrder';
import { useTranslation } from 'next-i18next';
import * as z from 'zod';
import { CustomerWrap, Form, StyledButton } from '../atoms/shared';

type CustomerDataForm = {
    addressEmail: ActiveCustomerType['emailAddress'];
    firstName: ActiveCustomerType['firstName'];
    lastName: ActiveCustomerType['lastName'];
    phoneNumber: ActiveCustomerType['phoneNumber'];
};

export const CustomerDetailsForm: React.FC<{
    initialCustomer: ActiveCustomerType;
    order: ActiveOrderType | null;
}> = ({ initialCustomer, order }) => {
    const { t } = useTranslation('customer');
    const { t: tErrors } = useTranslation('common');
    const [activeCustomer, setActiveCustomer] = useState<ActiveCustomerType>(initialCustomer);

    const customerSchema = z.object({
        emailAddress: z.string().email(tErrors('errors.email.invalid')).min(1, tErrors('errors.email.required')),
        firstName: z.string().min(1, { message: tErrors('errors.firstName.required') }),
        lastName: z.string().min(1, { message: tErrors('errors.lastName.required') }),
        phoneNumber: z.string().min(1, { message: tErrors('errors.phoneNumber.required') }),
    });

    const { register, handleSubmit, setError } = useForm<CustomerDataForm>({
        values: {
            addressEmail: activeCustomer?.emailAddress,
            firstName: activeCustomer?.firstName || '',
            lastName: activeCustomer?.lastName || '',
            phoneNumber: activeCustomer?.phoneNumber,
        },
        resolver: zodResolver(customerSchema),
    });

    const onCustomerDataChange: SubmitHandler<CustomerDataForm> = async input => {
        const { firstName, lastName, phoneNumber } = input;
        const { updateCustomer } = await storefrontApiMutation({
            updateCustomer: [{ input: { firstName, lastName, phoneNumber } }, ActiveCustomerSelector],
        });
        if (!updateCustomer) {
            setError('root', { message: tErrors('errors.backend.UNKNOWN_ERROR') });
            return;
        }
        setActiveCustomer(p => ({ ...p, ...updateCustomer }));
    };

    return (
        <CustomerWrap w100 gap="3.5rem">
            <Form onSubmit={handleSubmit(onCustomerDataChange)} noValidate>
                <Stack column itemsCenter>
                    <Input {...register('addressEmail')} label={t('accountPage.detailsForm.addressEmail')} disabled />
                    <Stack w100 gap="1.25rem">
                        <Input label={t('accountPage.detailsForm.firstName')} {...register('firstName')} />
                        <Input label={t('accountPage.detailsForm.lastName')} {...register('lastName')} />
                    </Stack>
                    <Input label={t('accountPage.detailsForm.phoneNumber')} {...register('phoneNumber')} />
                </Stack>
                <StyledButton type="submit">{t('accountPage.detailsForm.changeDetails')}</StyledButton>
            </Form>
            {order && <CustomerLastOrder order={order} />}
        </CustomerWrap>
    );
};
