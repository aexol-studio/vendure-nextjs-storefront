import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { BaseRemUnit } from '../sharedStyles';

interface ImageSwitcherArrowProps {
    size?: BaseRemUnit;
    right?: boolean;
    disabled?: boolean;
    handleClick: () => void;
}

export const ImageSwitcherArrow: React.FC<ImageSwitcherArrowProps> = ({
    size,
    disabled,
    handleClick,
    right = false,
}) => {
    return (
        <ArrowWrapper disabled={disabled} right={right} onClick={handleClick}>
            <ArrowLeft size={size || '3.5rem'} />
        </ArrowWrapper>
    );
};

const ArrowWrapper = styled.div<{ right?: boolean; disabled?: boolean }>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;

    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 6rem;
    height: 6rem;

    background: ${({ theme }) => theme.background.third};
    border-radius: ${p => p.theme.borderRadius};

    :hover {
        color: ${({ theme }) => theme.gray(50)};
    }
    ${({ disabled }) =>
        disabled &&
        css`
            pointer-events: none;
            opacity: 20%;
        `}
    ${({ right }) =>
        right
            ? css`
                  right: 1rem;
                  transform: translateY(-50%) rotate(180deg);
              `
            : css`
                  left: 1rem;
              `}
`;
