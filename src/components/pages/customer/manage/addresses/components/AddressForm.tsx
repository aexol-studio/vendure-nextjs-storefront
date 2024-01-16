import { Stack } from '@/src/components/atoms/Stack';
import { Button, FullWidthButton } from '@/src/components/molecules/Button';
import { CountrySelect, Input } from '@/src/components/forms';

import { CreateAddressType, ActiveAddressType, AvailableCountriesType } from '@/src/graphql/selectors';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import styled from '@emotion/styled';
import { CreditCard, Truck } from 'lucide-react';
import { TP } from '@/src/components/atoms/TypoGraphy';

export const AddressForm: React.FC<{
    onSubmit: SubmitHandler<CreateAddressType>;
    addressToEdit?: ActiveAddressType;
    availableCountries?: AvailableCountriesType[];
    country?: string;
    onModalClose?: () => void;
}> = ({ addressToEdit, onSubmit, availableCountries, country, onModalClose }) => {
    const { t } = useTranslation('customer');

    const schema = z.object({
        countryCode: z.string().length(2, { message: t('addressForm.errors.countryCode.required') }),
        streetLine1: z.string().min(1, { message: t('addressForm.errors.streetLine1.required') }),
        streetLine2: z.string().optional(),
        city: z.string().min(1, { message: t('addressForm.errors.city.required') }),
        company: z.string().optional(),
        fullName: z.string().min(1, { message: t('addressForm.errors.fullName.required') }),
        phoneNumber: z.string().min(1, { message: t('addressForm.errors.phone.required') }),
        postalCode: z.string().min(1, { message: t('addressForm.errors.postalCode.required') }),
        province: z.string().min(1, { message: t('addressForm.errors.province.required') }),
        defaultBillingAddress: z.boolean().optional(),
        defaultShippingAddress: z.boolean().optional(),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<CreateAddressType>({
        values: addressToEdit
            ? {
                  countryCode: addressToEdit.country.code,
                  streetLine1: addressToEdit.streetLine1,
                  streetLine2: addressToEdit.streetLine2,
                  city: addressToEdit.city,
                  company: addressToEdit.company,
                  fullName: addressToEdit.fullName,
                  phoneNumber: addressToEdit.phoneNumber,
                  postalCode: addressToEdit.postalCode,
                  province: addressToEdit.province,
                  defaultBillingAddress: addressToEdit.defaultBillingAddress,
                  defaultShippingAddress: addressToEdit.defaultShippingAddress,
              }
            : undefined,
        resolver: zodResolver(schema),
    });

    return (
        <Stack column w100 gap="3.5rem">
            <TP size="2.5rem" weight={600}>
                {t('addressForm.title')}
            </TP>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Stack w100 column gap="2rem">
                    <Input {...register('fullName')} label={t('addressForm.fullName')} error={errors.fullName} />
                    <Stack w100 itemsCenter gap="1.25rem">
                        <Input
                            type="tel"
                            label={t('addressForm.phone')}
                            {...register('phoneNumber', {
                                onChange: e => (e.target.value = e.target.value.replace(/[^0-9]/g, '')),
                            })}
                            error={errors.phoneNumber}
                        />
                        <Input {...register('company')} label={t('addressForm.company')} error={errors.company} />
                    </Stack>
                    <Stack w100 itemsCenter gap="1.25rem">
                        <Input
                            {...register('streetLine1')}
                            label={t('addressForm.streetLine1')}
                            error={errors.streetLine1}
                        />
                        <Input
                            {...register('streetLine2')}
                            label={t('addressForm.streetLine2')}
                            error={errors.streetLine2}
                        />
                    </Stack>
                    {availableCountries && (
                        <CountrySelect
                            {...register('countryCode')}
                            label={t('addressForm.countryCode')}
                            defaultValue={country}
                            options={availableCountries}
                            error={errors.countryCode}
                        />
                    )}
                    <Input {...register('city')} label={t('addressForm.city')} error={errors.city} />
                    <Input {...register('postalCode')} label={t('addressForm.postalCode')} error={errors.postalCode} />
                    <Input {...register('province')} label={t('addressForm.province')} error={errors.province} />
                </Stack>
                <Stack w100 column gap="1.25rem">
                    <Stack itemsCenter gap="2rem">
                        <CheckboxStack itemsCenter gap="0.75rem">
                            <DefaultBilling active={watch('defaultBillingAddress')} />
                            <Checkbox type="checkbox" {...register('defaultBillingAddress')} />
                            <label htmlFor="defaultBillingAddress">{t('addressForm.defaultBillingAddress')}</label>
                        </CheckboxStack>
                        <CheckboxStack itemsCenter gap="0.75rem">
                            <DefaultShipping active={watch('defaultShippingAddress')} />
                            <Checkbox type="checkbox" {...register('defaultShippingAddress')} />
                            <label htmlFor="defaultShippingAddress">{t('addressForm.defaultShippingAddress')}</label>
                        </CheckboxStack>
                    </Stack>
                    <Stack gap="3.5rem" w100 itemsCenter justifyBetween>
                        {onModalClose && (
                            <Button disabled={isSubmitting} onClick={onModalClose} type="button">
                                {t('addressForm.cancel')}
                            </Button>
                        )}
                        <FullWidthButton loading={isSubmitting} type="submit">
                            {addressToEdit ? t('addressForm.update') : t('addressForm.add')}
                        </FullWidthButton>
                    </Stack>
                </Stack>
            </Form>
        </Stack>
    );
};

const Form = styled.form`
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const CheckboxStack = styled(Stack)`
    position: relative;
    width: fit-content;
`;

const Checkbox = styled.input`
    appearance: none;
    border: none;
    outline: none;
    background: transparent;

    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
    left: 0;
    top: 0;
`;

const DefaultBilling = styled(CreditCard)<{ active?: boolean }>`
    color: ${p => (p.active ? p.theme.success : p.theme.gray(1000))};
    transition: color 0.2s ease-in-out;
`;
const DefaultShipping = styled(Truck)<{ active?: boolean }>`
    color: ${p => (p.active ? p.theme.success : p.theme.gray(1000))};
    transition: color 0.2s ease-in-out;
`;
