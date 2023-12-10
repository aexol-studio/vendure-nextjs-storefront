import { useCart } from '@/src/state/cart';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TagIcon } from 'lucide-react';
import styled from '@emotion/styled';
import { Stack } from '../atoms/Stack';
import { FormError } from '@/src/pages/[locale]/checkout/components/ui/FormError';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const DiscountForm = () => {
    const schema = z.object({ code: z.string().min(1, 'Please enter a code') });
    const { applyCouponCode } = useCart();
    const {
        handleSubmit,
        register,
        setError,
        formState: { errors },
        reset,
    } = useForm<{ code: string }>({
        resolver: zodResolver(schema),
    });
    const onSubmit: SubmitHandler<{ code: string }> = async ({ code }) => {
        try {
            const data = await applyCouponCode(code);
            if (data) {
                reset();
            } else {
                setError('code', { message: "Couldn't find a coupon with that code" });
            }
        } catch (error) {
            setError('code', { message: 'Something went wrong' });
        }
    };

    return (
        <Stack column gap="0.25rem">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Input {...register('code', { required: true })} placeholder="Coupon Code" />
                <Button type="submit">
                    <TagIcon size={24} />
                </Button>
            </Form>
            <FormError
                initial={{ opacity: 0 }}
                animate={{ opacity: errors.code?.message ? 1 : 0 }}
                transition={{ duration: 0.2 }}>
                {errors.code?.message}
            </FormError>
        </Stack>
    );
};

const Button = styled.button`
    appearance: none;
    border: none;
    background: transparent;

    display: flex;
    align-items: center;
    justify-content: center;
`;

const Input = styled.input`
    appearance: none;
    border: none;
    outline: none;
    background: transparent;

    width: calc(100% - 3.2rem);
    height: 100%;

    font-size: 1.6rem;
`;

const Form = styled.form`
    width: 100%;
    position: relative;

    padding: 1.6rem;

    display: flex;
    align-items: center;
    gap: 1.6rem;

    border-radius: 2px;
    border: 1px solid ${p => p.theme.gray(100)};
`;
