import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { TP, ProductImage, Stack } from '@/src/components/atoms';

interface ProductImageWithInfoProps {
    size: 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' | 'thumbnail-big';

    href: string;
    text: string;
    imageSrc?: string;
    withHover?: boolean;
    withText?: boolean;
}

export const ProductImageWithInfo: React.FC<ProductImageWithInfoProps> = ({
    href,
    text,
    size,
    imageSrc,
    withHover,
    withText,
}) => {
    return (
        <StyledLink size={size} withHover={withHover} href={href}>
            <ProductImage src={imageSrc} size={size} />
            <AbsoluteStyledTP upperCase size="2rem">
                {text}
            </AbsoluteStyledTP>
            <Stack column>{withText && <StyledTP>{text}</StyledTP>}</Stack>
        </StyledLink>
    );
};

const StyledLink = styled(Link)<{ withHover?: boolean; size: string }>`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    ${({ size }) => {
        if (['thumbnail', 'thumbnail-big'].includes(size)) {
            return `align-items: flex-start;`;
        }
        return `align-items: center;`;
    }}

    ${({ withHover }) => withHover && `:hover p { display: block; }`}
`;
const StyledTP = styled(TP)`
    color: ${p => p.theme.text.main};
`;

const AbsoluteStyledTP = styled(TP)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${p => p.theme.gray(100)};
    text-align: center;
    width: 100%;
    padding-block: 1rem;
    background-color: ${p => p.theme.grayAlpha(700, 0.5)};
    display: none;
`;
