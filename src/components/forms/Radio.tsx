import { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms/Stack';
import { FormError, Label } from './shared';

const RadioWrapper = styled(Stack)<{ active?: boolean }>`
    position: relative;
    width: fit-content;
    padding: 0.75rem 1.75rem;
    border-radius: ${p => p.theme.borderRadius};
    border: 1px solid;
    color: ${p => (p.active ? p.theme.text.main : p.theme.text.inactive)};
    transition: all 200ms;
`;

const StyledRadio = styled.input`
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
`;

const Icon = styled.div`
    color: currentColor;
`;

type InputType = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon?: React.ReactNode;
    error?: FieldError;
};

export const Radio = forwardRef((props: InputType, ref: React.ForwardedRef<HTMLInputElement>) => {
    const { label, error, icon, ...rest } = props;
    return (
        <Stack column itemsCenter gap="0.25rem">
            <RadioWrapper active={rest.checked} gap="0.75rem" itemsCenter>
                <Icon>{icon}</Icon>
                <StyledRadio ref={ref} {...rest} type="radio" />
                <Label htmlFor={props.name}>{label}</Label>
            </RadioWrapper>
            {error?.message && (
                <FormError initial={{ opacity: 0 }} animate={{ opacity: error ? 1 : 0 }} transition={{ duration: 0.2 }}>
                    {error?.message}
                </FormError>
            )}
        </Stack>
    );
});

Radio.displayName = 'Radio';
