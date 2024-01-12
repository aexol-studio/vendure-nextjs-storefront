import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';

export const Content = styled(ContentContainer)`
    position: relative;
`;

export const Main = styled(Stack)`
    gap: 5rem;
    min-height: 100vh;
    padding: 4rem 0;
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        flex-direction: column-reverse;
    }
`;
