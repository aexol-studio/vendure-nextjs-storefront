import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';

export const FormWrapper = styled(Stack)`
    padding: 5.5rem 7.5rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: 0 0 0.5rem ${({ theme }) => theme.background.third};
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
`;
