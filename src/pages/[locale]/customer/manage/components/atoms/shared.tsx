import { Stack } from '@/src/components/atoms/Stack';
import { Button } from '@/src/components/molecules/Button';
import styled from '@emotion/styled';

export const CustomerWrap = styled(Stack)`
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        flex-direction: column;
    }
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

export const StyledButton = styled(Button)<{ active?: boolean }>`
    background: ${p => p.active && p.theme.gray(700)};
    font-size: 1.2rem;
`;
