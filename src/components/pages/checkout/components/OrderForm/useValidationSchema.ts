import { useTranslation } from 'next-i18next';
import * as z from 'zod';

export const useValidationSchema = () => {
    const { t } = useTranslation('checkout');

    const userObject = z.object({
        emailAddress: z.string().email(),
        firstName: z.string().min(1, { message: t('orderForm.errors.firstName.required') }),
        lastName: z.string().min(1, { message: t('orderForm.errors.lastName.required') }),
        phoneNumber: z
            .string()
            .min(1, { message: t('orderForm.errors.phone.required') })
            .optional(),

        deliveryMethod: z.string().min(1, { message: t('deliveryMethod.errors.required') }),

        terms: z.boolean().refine(value => value, { message: t('orderForm.errors.terms.required') }),

        shippingDifferentThanBilling: z.boolean(),
        // userNeedInvoice: z.boolean(),
        createAccount: z.boolean().default(false).optional(),

        // NIP: z.string().min(1, { message: t('orderForm.errors.NIP.required') }),
        // password: z.string().min(8, { message: t('orderForm.errors.password.required') }),
        // confirmPassword: z.string().min(8, { message: t('orderForm.errors.confirmPassword.required') }),
    });

    const billingObject = z.object({
        fullName: z.string().min(1, { message: t('orderForm.errors.fullName.required') }),
        streetLine1: z.string().min(1, { message: t('orderForm.errors.streetLine1.required') }),
        streetLine2: z.string().optional(),
        city: z.string().min(1, { message: t('orderForm.errors.city.required') }),
        countryCode: z.string().length(2, { message: t('orderForm.errors.countryCode.required') }),
        province: z.string().min(1, { message: t('orderForm.errors.province.required') }),
        postalCode: z.string().min(1, { message: t('orderForm.errors.postalCode.required') }),
        company: z.string().optional(),
    });

    const shippingObject = z.object({
        fullName: z.string().min(1, { message: t('orderForm.errors.fullName.required') }),
        streetLine1: z.string().min(1, { message: t('orderForm.errors.streetLine1.required') }),
        streetLine2: z.string().optional(),
        city: z.string().min(1, { message: t('orderForm.errors.city.required') }),
        countryCode: z.string().length(2, { message: t('orderForm.errors.countryCode.required') }),
        province: z.string().min(1, { message: t('orderForm.errors.province.required') }),
        postalCode: z.string().min(1, { message: t('orderForm.errors.postalCode.required') }),
        company: z.string().optional(),
    });

    const billingSchema = z.object({
        shippingDifferentThanBilling: z.literal(false),
        billing: billingObject,
    });
    const shippingSchema = z.object({
        shippingDifferentThanBilling: z.literal(true),
        billing: billingObject,
        shipping: shippingObject,
    });

    const defaultSchema = z.discriminatedUnion('shippingDifferentThanBilling', [billingSchema, shippingSchema]);
    // const NIPSchema = z.discriminatedUnion('userNeedInvoice', [
    //     z.object({
    //         userNeedInvoice: z.literal(true),
    //         NIP: z.string().min(1, { message: t('orderForm.errors.NIP.required') }),
    //     }),
    //     z.object({
    //         userNeedInvoice: z.literal(false),
    //     }),
    // ]);
    const passwordSchema = z
        .discriminatedUnion('createAccount', [
            z.object({
                createAccount: z.literal(true),
                password: z.string().min(8, { message: t('orderForm.errors.password.required') }),
                confirmPassword: z.string().min(8, { message: t('orderForm.errors.confirmPassword.required') }),
            }),
            z.object({
                createAccount: z.literal(false),
            }),
        ])
        .refine(value => (value.createAccount ? value.password === value.confirmPassword : true), {
            message: t('orderForm.errors.confirmPassword.notMatch'),
            path: ['confirmPassword'],
        });

    const mainIntersection = z.intersection(defaultSchema, userObject);
    const schema = z.intersection(passwordSchema, mainIntersection);
    // const schema = z.intersection(NIPSchema, userAccountIntersection);

    return schema;
};
