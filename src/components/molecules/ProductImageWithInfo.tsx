import styled from '@emotion/styled';

import React from 'react';
import { TP } from '../atoms/TypoGraphy';
import { ProductImage } from '../atoms/ProductImage';
import Link from 'next/link';

interface ProductImageWithInfoProps {
    size: 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' | 'thumbnail-big';
    rounded?: boolean;
    href: string;
    text: string;
    imageSrc?: string;
}

export const ProductImageWithInfo: React.FC<ProductImageWithInfoProps> = ({ href, text, rounded, size, imageSrc }) => {
    return (
        <StyledLink href={href}>
            <ProductImage src={imageSrc} size={size} rounded={rounded} />
            <StyledTP upperCase size="2rem">
                {text}
            </StyledTP>
        </StyledLink>
    );
};

const StyledLink = styled(Link)`
    position: relative;
    :hover p {
        display: block;
    }
`;
const StyledTP = styled(TP)`
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
