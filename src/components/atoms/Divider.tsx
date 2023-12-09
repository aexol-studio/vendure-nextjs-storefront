import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
type DirectionType = 'horizontal' | 'vertical';

export const Divider: React.FC<{ direction?: DirectionType }> = ({ direction = 'horizontal' }) => {
    return <StyledDivider direction={direction} />;
};

const StyledDivider = styled.div<{ direction: DirectionType }>`
    background-color: ${({ theme }) => theme.gray(400)};
    ${({ direction }) =>
        direction === 'horizontal'
            ? css`
                  width: 100%;
                  height: 1px;
              `
            : css`
                  height: 100%;
                  width: 1px;
              `};
`;
