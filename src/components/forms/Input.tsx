import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { FieldError } from 'react-hook-form';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms/Stack';
import { FormRequired, FormError, FormErrorWrapper, Label } from './atoms';
import { AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';

type InputType = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: FieldError;
};

export const Input = forwardRef((props: InputType, ref: React.ForwardedRef<HTMLInputElement>) => {
    const { label, error, ...rest } = props;
    const [localType, setLocalType] = useState(props.type);
    const isPassword = props.type === 'password';

    return (
        <Stack w100 column gap="0.25rem">
            <InputWrapper w100 column>
                <Label htmlFor={props.name}>
                    {label}
                    {props.required && <FormRequired>&nbsp;*</FormRequired>}
                </Label>
                <StyledInput {...rest} ref={ref} error={!!error?.message} type={localType} />
                {isPassword && (
                    <EyeWrapper
                        justifyCenter
                        itemsCenter
                        active={localType !== 'password'}
                        onClick={() => setLocalType(localType === 'password' ? 'text' : 'password')}>
                        <Eye size={'1.8rem'} />
                    </EyeWrapper>
                )}
            </InputWrapper>
            <FormErrorWrapper>
                <AnimatePresence>
                    {error?.message && (
                        <FormError
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}>
                            {error?.message}
                        </FormError>
                    )}
                </AnimatePresence>
            </FormErrorWrapper>
        </Stack>
    );
});

const InputWrapper = styled(Stack)`
    position: relative;
`;

const EyeWrapper = styled(Stack)<{ active: boolean }>`
    position: absolute;
    top: 50%;
    right: 0.75rem;

    height: 1.8rem;
    width: 1.8rem;

    cursor: pointer;

    & > svg {
        color: ${p => (p.active ? p.theme.gray(800) : p.theme.gray(200))};
        transition: color 0.2s ease-in-out;
    }
`;

export const StyledInput = styled.input<{ error?: boolean }>`
    margin-top: 0.6rem;
    padding: 0.5rem 0.75rem;
    color: ${p => p.theme.gray(900)};
    border: 1px solid ${p => p.theme.gray(100)};
    outline: none;
    border-color: ${p => p.theme.gray(600)};

    :focus {
        border-color: ${p => p.theme.gray(400)};
    }

    ${p => p.error && `border-color: ${p.theme.error} !important;`}
`;

Input.displayName = 'Input';
