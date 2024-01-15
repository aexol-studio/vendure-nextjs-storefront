import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { Stack } from '@/src/components/atoms/Stack';
import { FormError, FormErrorWrapper, FormRequired, Label } from './shared';

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
                <CheckboxIconHolder>
                    <AnimatePresence>
                        {(props.checked || state) && (
                            <CheckboxAnimation
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}>
                                <CheckboxIcon size="2rem" />
                            </CheckboxAnimation>
                        )}
                    </AnimatePresence>
                </CheckboxIconHolder>
                <Checkbox
                    type="checkbox"
                    {...rest}
                    ref={ref}
                    onChange={e => {
                        setState(e.target.checked);
                        onChange && onChange(e);
                    }}
                />
                <Label htmlFor={props.name}>
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
`;

const CheckboxAnimation = styled(motion.div)`
    width: 100%;

    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const CheckboxIcon = styled(Check)`
    color: ${p => p.theme.gray(1000)};
`;

const CheckboxIconHolder = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: calc(3rem - 1px);
    min-height: calc(3rem - 1px);
    border: 1px solid ${p => p.theme.gray(1000)};
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
