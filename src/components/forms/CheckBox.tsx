import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { Stack } from '../atoms/Stack';
import { FormError, FormErrorWrapper, FormRequired, Label } from './atoms';

type InputType = InputHTMLAttributes<HTMLInputElement> & {
    label: string | React.ReactNode;
    error?: FieldError;
};

export const CheckBox = forwardRef((props: InputType, ref: React.ForwardedRef<HTMLInputElement>) => {
    const { label, error, onChange, ...rest } = props;
    const [state, setState] = useState<boolean>(!!props.value);
    return (
        <Wrapper column gap="0.125rem">
            <CheckboxStack itemsCenter gap="0.75rem">
                <AnimatePresence>
                    <CheckboxIconHolder>
                        {(props.checked || state) && (
                            <CheckboxAnimation
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}>
                                <CheckboxIcon size="1.6rem" />
                            </CheckboxAnimation>
                        )}
                    </CheckboxIconHolder>
                </AnimatePresence>
                <Checkbox
                    type="checkbox"
                    {...rest}
                    ref={ref}
                    onChange={e => {
                        setState(e.target.checked);
                        onChange && onChange(e);
                    }}
                />
                <Label htmlFor={props.name} style={{ zIndex: typeof label === 'string' ? 'auto' : '2' }}>
                    {label}
                    {props.required && <FormRequired>&nbsp;*</FormRequired>}
                </Label>
            </CheckboxStack>
            {props.required && error ? (
                <FormErrorWrapper>
                    <AnimatePresence>
                        {error.message && (
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
            ) : null}
        </Wrapper>
    );
});

CheckBox.displayName = 'CheckBox';

const Wrapper = styled(Stack)`
    position: relative;
    width: fit-content;
    margin: 1.25rem 0;
`;

const CheckboxAnimation = styled(motion.div)`
    width: 100%;
    height: 100%;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const CheckboxIcon = styled(Check)`
    width: 100%;
    height: 100%;
    color: ${p => p.theme.gray(1000)};
`;

const CheckboxIconHolder = styled.div`
    position: relative;
    min-width: 1.6rem;
    min-height: 1.6rem;
    border-radius: 2px;
    border: 1px solid ${p => p.theme.gray(200)};
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
