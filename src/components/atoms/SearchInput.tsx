import { thv } from '@/src/theme';
import styled from '@emotion/styled';

export const SearchInput = styled.input`
    background: ${thv.background.main};
    border: 1px solid ${thv.text.main};
    border-radius: ${p => p.theme.borderRadius};
    font-size: 1.25rem;
    max-width: 100%;
    min-width: 30rem;
    display: flex;
    height: 4.8rem;
    padding: 1.2rem 1.6rem;
    align-items: center;
    gap: 2.4rem;
    align-self: stretch;
`;
