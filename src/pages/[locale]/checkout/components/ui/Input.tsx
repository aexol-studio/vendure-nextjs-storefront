import { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { Label } from '@/src/components/atoms/Label';
import { Stack } from '@/src/components/atoms/Stack';

export const StyledInput = styled.input<{ error?: boolean }>`
    padding: 0.5rem 0.75rem;
    color: ${p => p.theme.gray(900)};
    border: 1px solid ${p => p.theme.gray(100)};
    :focus {
        border-color: ${p => p.theme.gray(400)};
    }
    outline: none;
`;

type InputType = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: FieldError;
};

export const Input = forwardRef((props: InputType, ref: React.ForwardedRef<HTMLInputElement>) => {
    const { label, error, ...rest } = props;
    return (
        <Stack column gap="0.25rem">
            <Label>{label}</Label>
            <StyledInput ref={ref} {...rest} />
            <motion.span
                style={{ height: '1.4rem', color: '#f00', fontSize: '1.2rem', fontWeight: 500 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: error ? 1 : 0 }}
                transition={{ duration: 0.2 }}>
                {error?.message}
            </motion.span>
        </Stack>
    );
});

Input.displayName = 'Input';
