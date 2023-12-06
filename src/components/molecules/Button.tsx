import styled from '@emotion/styled';

export const Button = styled.button`
    background-color: ${p => p.theme.accent(600)};
    color: ${p => p.theme.gray(0)};
    border: 0;
    border-radius: 2rem;
    padding: 1rem 3rem;
    font-weight: 600;
    outline: 0;
    min-width: 12rem;
`;
