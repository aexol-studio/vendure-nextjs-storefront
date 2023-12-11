import styled from '@emotion/styled';

export const Facet = styled.div`
    padding: 0.4rem 1.8rem;
    border: 1px solid ${p => p.theme.gray(500)};
    border-radius: 2rem;
    user-select: none;
    :hover {
        background-color: ${p => p.theme.gray(50)};
    }
`;
