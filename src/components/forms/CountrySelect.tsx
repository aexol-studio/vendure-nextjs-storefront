import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import { Stack } from '@/src/components/atoms/Stack';
import { AvailableCountriesType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { Label, FormError, FormRequired, FormErrorWrapper } from './atoms';
import { AnimatePresence } from 'framer-motion';

type CountrySelectType = SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    options: AvailableCountriesType[];
    error?: FieldError;
};

export const CountrySelect = forwardRef((props: CountrySelectType, ref: React.ForwardedRef<HTMLSelectElement>) => {
    const { label, error, options, required, ...rest } = props;
    return (
        <Stack column gap="0.25rem">
            <Label htmlFor={props.name}>
                {label}
                {required && <FormRequired>&nbsp;*</FormRequired>}
            </Label>
            <StyledSelect ref={ref} {...rest}>
                {options?.map(({ name, code }) => (
                    <option key={code} value={code}>
                        {name}
                    </option>
                ))}
            </StyledSelect>
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

CountrySelect.displayName = 'CountrySelect';

export const StyledSelect = styled.select<{ error?: boolean }>`
    margin-top: 0.25rem;
    padding: 0.5rem 0.75rem;
    color: ${p => p.theme.gray(900)};
    border: 1px solid ${p => p.theme.gray(600)};
    :focus {
        border-color: ${p => p.theme.gray(400)};
    }
    outline: none;
`;
