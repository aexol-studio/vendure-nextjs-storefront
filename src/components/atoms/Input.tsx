import { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import styled from '@emotion/styled';
import { Label } from '@/src/components/atoms/Label';
import { Stack } from '@/src/components/atoms/Stack';
import { FormError } from '../../pages/[locale]/checkout/components/ui/FormError';

export const StyledInput = styled.input<{ error?: boolean }>`
    margin-top: 4px;
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
    errorSpecialTrans?: React.ReactNode;
};

export const Input = forwardRef((props: InputType, ref: React.ForwardedRef<HTMLInputElement>) => {
    const { label, error, errorSpecialTrans, ...rest } = props;
    const errorExists = error || errorSpecialTrans;
    return (
        <Stack column gap="0.25rem">
            <Label>{label}</Label>
            <StyledInput ref={ref} {...rest} />
            <FormError
                initial={{ opacity: 0 }}
                animate={{ opacity: errorExists ? 1 : 0 }}
                transition={{ duration: 0.2 }}>
                {errorSpecialTrans ? errorSpecialTrans : error?.message}
            </FormError>
        </Stack>
    );
});

Input.displayName = 'Input';
