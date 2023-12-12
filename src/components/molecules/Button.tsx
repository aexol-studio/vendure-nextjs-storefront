import { thv } from '@/src/theme';
import styled from '@emotion/styled';

export const Button = styled.button`
    background-color: ${thv.button.back};
    color: ${thv.button.front};
    border: 0;
    border-radius: ${p => p.theme.borderRadius};
    padding: 1rem 3rem;
    font-weight: 600;
    outline: 0;
    min-width: 12rem;
    :hover {
        color: ${p => p.theme.button.hover?.front || p.theme.button.front};
        background: ${p => p.theme.button.hover?.back || p.theme.button.back};
    }
`;

export const FullWidthButton = styled(Button)`
    width: 100%;
`;
export const SecondaryButton = styled.button`
    background-color: ${thv.button.front};
    color: ${thv.button.back};
    border: 0;
    border-radius: ${p => p.theme.borderRadius};
    padding: 1rem 3rem;
    font-weight: 600;
    outline: 0;
    min-width: 12rem;
    border: 1px solid ${thv.button.back};
    :hover {
        background: ${p => p.theme.gray(100)};
    }
`;

export const FullWidthSecondaryButton = styled(SecondaryButton)`
    width: 100%;
`;
export const IconButton = styled.button<{ isActive?: boolean }>`
    color: ${thv.button.icon.front};
    border: 0;
    border-radius: 100%;
    font-weight: 600;
    outline: 0;
    width: 2.4rem;
    height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => p.theme.button.icon.back || 'transparent'};
    svg {
        width: 2rem;
        height: 2rem;
    }
    :hover {
        box-shadow: none;
    }
`;
