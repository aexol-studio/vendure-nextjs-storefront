import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const ContentContainer = styled.div`
    max-width: 100%;
    width: 1440px;
    display: flex;
    flex-direction: column;
    gap: 4rem;
    margin: auto;
    padding: 0 4rem;
    ${css`
        @media (max-width: 1560px) {
            width: 1280px;
        }
    `}
`;
