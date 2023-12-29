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
import { SuccessBanner } from '@/src/components/forms/atoms/SuccessBanner';
import { AnimatePresence } from 'framer-motion';

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
    const [hideSuccessBanner, setHideSuccessBanner] = useState(false);

    const customerSchema = z.object({
        firstName: z.string().min(1, { message: tErrors('errors.firstName.required') }),
        lastName: z.string().min(1, { message: tErrors('errors.lastName.required') }),
        phoneNumber: z
            .string()
            .min(1, { message: tErrors('errors.phoneNumber.required') })
            .optional(),
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<CustomerDataForm>({
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

        const isChanged = Object.entries(input).some(([key, value]) => {
            if (activeCustomer[key as keyof typeof activeCustomer] === value) return true;
        });

        if (isChanged) return;

        if (!updateCustomer) {
            setError('root', { message: tErrors('errors.backend.UNKNOWN_ERROR') });
            return;
        }
        setActiveCustomer(p => ({ ...p, ...updateCustomer }));
        setHideSuccessBanner(true);

        setTimeout(() => {
            setHideSuccessBanner(false);
        }, 3000);
    };

    const handleHideSuccessBanner = () => {
        setHideSuccessBanner(false);
    };

    return (
        <>
            <AnimatePresence>
                {hideSuccessBanner && (
                    <SuccessBanner
                        hideBanner={handleHideSuccessBanner}
                        successMessage="Dane użytkownika zostały pomyślnie zaktualizowane"
                    />
                )}
            </AnimatePresence>
            <CustomerWrap
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                }}>
                <Form onSubmit={handleSubmit(onCustomerDataChange)} noValidate>
                    <Stack column itemsCenter>
                        <Input
                            {...register('addressEmail')}
                            label={t('accountPage.detailsForm.addressEmail')}
                            disabled
                        />
                        <Stack w100 gap="1.25rem">
                            <Input
                                label={t('accountPage.detailsForm.firstName')}
                                {...register('firstName')}
                                error={errors.firstName}
                            />
                            <Input
                                label={t('accountPage.detailsForm.lastName')}
                                {...register('lastName')}
                                error={errors.lastName}
                            />
                        </Stack>
                        <Input
                            label={t('accountPage.detailsForm.phoneNumber')}
                            {...register('phoneNumber')}
                            error={errors.phoneNumber}
                        />
                    </Stack>
                    <StyledButton type="submit">{t('accountPage.detailsForm.changeDetails')}</StyledButton>
                </Form>
                {order && <CustomerLastOrder order={order} />}
            </CustomerWrap>
        </>
    );
};
