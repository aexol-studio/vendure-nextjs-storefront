import styled from '@emotion/styled';
import { css } from '@emotion/react';

export const Divider = styled.div<{ vertical?: boolean }>`
    background-color: ${({ theme }) => theme.gray(100)};
    ${({ vertical }) =>
        !vertical
            ? css`
                  width: 100%;
                  height: 1px;
              `
            : css`
                  height: 100%;
                  width: 1px;
              `};
`;
