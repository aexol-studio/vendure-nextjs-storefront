import styled from '@emotion/styled';

export const MainGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, max(240px, 100%/5)), 1fr));
    gap: 1.5rem;
    row-gap: 8rem;
`;
