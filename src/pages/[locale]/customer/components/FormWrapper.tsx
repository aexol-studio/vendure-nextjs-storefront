import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';

export const FormWrapper = styled(Stack)`
    position: relative;
    padding: 5.5rem 7.5rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: 0 0 0.5rem ${({ theme }) => theme.grayAlpha(400, 200)};
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

export const AbsoluteError = styled(Stack)`
    position: absolute;
    top: 0;
    left: 0;
    padding: 1rem;
`;

export const FormContent = styled(Stack)`
    max-width: 22rem;
`;
