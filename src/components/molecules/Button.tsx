import styled from '@emotion/styled';

export const Button = styled.button`
    background-color: ${p => p.theme.gray(900)};
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

export const IconButton = styled.button<{ isActive?: boolean }>`
    color: ${p => p.theme.gray(900)};
    border: 0;
    border-radius: 100%;
    font-weight: 600;
    outline: 0;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    svg {
        width: 2rem;
        height: 2rem;
    }
    :hover {
        box-shadow: none;
    }
`;
