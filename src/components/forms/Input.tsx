import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { FieldError } from 'react-hook-form';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms/Stack';
import { FormRequired, Label } from './shared';
import { AnimatePresence, motion } from 'framer-motion';
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
                <Label htmlFor={props.name} style={{ letterSpacing: '0.5px', fontWeight: 600 }}>
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
                {error?.message && (
                    <AnimatePresence>
                        <Error>
                            <FormError
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}>
                                {error?.message}
                            </FormError>
                        </Error>
                    </AnimatePresence>
                )}
            </InputWrapper>
        </Stack>
    );
});

const Error = styled.div`
    position: absolute;
    right: 1.5rem;
`;

export const FormError = styled(motion.span)`
    color: ${p => p.theme.error};
    font-size: 1rem;
    font-weight: 700;
    margin: 0.4rem 0 0.8rem 0;
`;

const InputWrapper = styled(Stack)`
    position: relative;
    padding: 1.5rem;
    border: 1px solid ${p => p.theme.gray(100)};
`;

const EyeWrapper = styled(Stack)<{ active: boolean }>`
    position: absolute;
    top: 50%;
    right: 1.5rem;

    height: 1.8rem;
    width: 1.8rem;

    cursor: pointer;

    & > svg {
        color: ${p => (p.active ? p.theme.gray(800) : p.theme.gray(200))};
        transition: color 0.2s ease-in-out;
    }
`;

export const StyledInput = styled.input<{ error?: boolean }>`
    border: 0;
    outline: none;
    margin-top: 0.6rem;
    padding: 0.5rem 0.25rem;
    color: ${p => p.theme.gray(900)};
    border-bottom: 1px solid ${p => p.theme.gray(100)};

    :focus {
        border-color: ${p => p.theme.gray(1000)};
    }

    ::placeholder {
        color: ${p => p.theme.placeholder};
    }
    ${p => p.error && `border-color: ${p.theme.error} !important;`}
`;

Input.displayName = 'Input';
