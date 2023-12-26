import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';

export const FormContainer = styled(Stack)`
    width: 100%;
    min-height: calc(100vh - 6rem);
    flex-direction: column;
    gap: 3.5rem;
    justify-content: center;
    align-items: center;
`;

export const FormWrapper = styled(Stack)`
    position: relative;
    padding: 5.5rem 7.5rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: 0 0 0.5rem ${({ theme }) => theme.shadow};
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

export const Absolute = styled(Stack)`
    position: absolute;
    top: 0;
    left: 0;
    padding: 1rem;
`;

export const FormContent = styled(Stack)`
    max-width: 22rem;
`;
