import styled from '@emotion/styled';

export const ContentContainer = styled.div`
    max-width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4rem;
    margin: auto;
    width: 1280px;
    padding: 0;

    @media (max-width: ${({ theme }) => theme.breakpoints['2xl']}) {
        width: 1440px;
        padding: 0 4rem;
    }
`;
