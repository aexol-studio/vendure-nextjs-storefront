import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { BaseRemUnit } from '../sharedStyles';

export const Divider = styled.div<{ vertical?: boolean; marginBlock?: BaseRemUnit }>`
    background-color: ${({ theme }) => theme.gray(100)};
    margin-block: ${({ marginBlock }) => marginBlock || 0};
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
