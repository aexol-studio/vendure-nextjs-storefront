import { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms/Stack';
import { FormError, Label } from './atoms';

const RadioWrapper = styled(Stack)`
    position: relative;
    width: fit-content;
    padding: 0.75rem 1.75rem;
    border-radius: ${p => p.theme.borderRadius};
    border: 1px solid ${p => p.theme.gray(200)};
    box-shadow: 0 0 0.5rem ${p => p.theme.gray(200)};
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

const Icon = styled.div<{ active?: boolean }>`
    color: ${p => (p.active ? p.theme.success : p.theme.gray(1000))};
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
            <RadioWrapper gap="0.75rem" itemsCenter>
                <Icon active={rest.checked}>{icon}</Icon>
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
