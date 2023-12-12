import styled from '@emotion/styled';

export const Facet = styled.div`
    padding: 0.5rem 1.75rem;
    border: 1px solid ${p => p.theme.gray(500)};
    border-radius: ${p => p.theme.borderRadius};
    user-select: none;
    :hover {
        background-color: ${p => p.theme.gray(50)};
    }
    box-shadow: 1px 1px 2px 0px ${({ theme }) => theme.gray(500)};
`;
