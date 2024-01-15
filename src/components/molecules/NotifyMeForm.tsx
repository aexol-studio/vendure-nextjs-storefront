// import { useCart } from '@/src/state/cart';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'next-i18next';
import { Button } from './Button';

export const NotifyMeForm = () => {
    const { t } = useTranslation('common');
    const schema = z.object({ email: z.string().email(t('notifyMe.invalidEmail')) });
    //get own mutation to add customer to notify list
    // const { myAddToNotifyList } = useCart();
    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm<{ email: string }>({
        resolver: zodResolver(schema),
    });
    const onSubmit: SubmitHandler<{ email: string }> = async () => {
        // perform own logic to add customer to notify list
        // try {
        //     const data = await myAddToNotifyList(email);
        //     if (data) {
        //          added to notify list
        //     } else {
        //         setError('code', { message: t('notifyMe.backendError') });
        //     }
        // } catch (error) {
        //     setError('code', { message: t('commonError') });
        // }

        reset();
    };

    return (
        <Stack column style={{ position: 'relative' }}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Stack style={{ height: '100%' }}>
                    <Input {...register('email', { required: true })} placeholder={t('notifyMe.placeholder')} />
                    <StyledButton type="submit">{t('send')}</StyledButton>
                </Stack>
            </Form>
            <FormError
                style={{ margin: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: errors.email?.message ? 1 : 0 }}
                transition={{ duration: 0.2 }}>
                {errors.email?.message}
            </FormError>
        </Stack>
    );
};

const StyledButton = styled(Button)`
    padding-block: 0.75rem;
`;

const Input = styled.input`
    appearance: none;
    outline: none;

    padding: 0.2rem 1rem;
    border: 1px solid ${p => p.theme.gray(100)};
`;

const Form = styled.form`
    display: flex;
    align-items: center;
`;

const FormError = styled(motion.div)`
    position: absolute;
    top: 100%;
    left: 0;
    color: ${p => p.theme.error};
    font-size: 1.2rem;
    font-weight: 500;
    min-height: 1.8rem;
    margin: 0.4rem 0 0.8rem 0;
`;
