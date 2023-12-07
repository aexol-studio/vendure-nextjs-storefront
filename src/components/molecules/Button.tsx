import styled from '@emotion/styled';

export const Button = styled.button`
    background-color: ${p => p.theme.accent(900)};
    color: ${p => p.theme.gray(0)};
    border: 0;
    border-radius: ${p => p.theme.borderRadius};
    padding: 1rem 3rem;
    font-weight: 600;
    outline: 0;
    min-width: 12rem;
`;

export const FullWidthButton = styled(Button)`
    width: 100%;
`;
