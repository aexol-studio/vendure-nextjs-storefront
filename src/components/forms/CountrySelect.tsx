import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import { Stack } from '@/src/components/atoms/Stack';
import { AvailableCountriesType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { Label, FormError, FormRequired } from './shared';
import { AnimatePresence } from 'framer-motion';

type CountrySelectType = SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    options: AvailableCountriesType[];
    error?: FieldError;
};

export const CountrySelect = forwardRef((props: CountrySelectType, ref: React.ForwardedRef<HTMLSelectElement>) => {
    const { label, error, options, required, ...rest } = props;
    return (
        <Wrapper w100 column gap="0.5rem">
            <SelectWrapper column gap="0.75rem">
                <Label htmlFor={props.name}>
                    {label}
                    {required && <FormRequired>&nbsp;*</FormRequired>}
                </Label>
                <StyledSelect ref={ref} {...rest}>
                    {options?.map(({ name, code }, idx) => (
                        <option key={code + idx} value={code}>
                            {name}
                        </option>
                    ))}
                </StyledSelect>
                {error?.message ? (
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
                ) : null}
            </SelectWrapper>
        </Wrapper>
    );
});

CountrySelect.displayName = 'CountrySelect';

const Error = styled.div`
    position: absolute;
    right: 1.5rem;
`;

const Wrapper = styled(Stack)`
    border: 1px solid ${p => p.theme.gray(100)};
    height: 100%;
`;

const SelectWrapper = styled(Stack)`
    position: relative;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
`;

export const StyledSelect = styled.select<{ error?: boolean }>`
    width: 100%;
    padding: 0.5rem 0.75rem;

    color: ${p => p.theme.gray(900)};
    border: 1px solid ${p => p.theme.gray(600)};
    :focus {
        border-color: ${p => p.theme.gray(400)};
    }
    outline: none;
`;
