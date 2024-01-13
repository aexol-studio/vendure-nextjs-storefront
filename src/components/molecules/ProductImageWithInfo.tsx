import React from 'react';
import styled from '@emotion/styled';
import { TP, ProductImage, Link } from '@/src/components/atoms';

interface ProductImageWithInfoProps {
    size: 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' | 'thumbnail-big';
    alt?: string;
    title?: string;
    href: string;
    text?: string;
    imageSrc?: string;
    lazy?: boolean;
}

export const ProductImageWithInfo: React.FC<ProductImageWithInfoProps> = ({
    href,
    text,
    alt,
    title,
    size,
    imageSrc,
    lazy,
}) => {
    return (
        <StyledLink size={size} hover={text ? 1 : 0} href={href}>
            <ProductImage {...(lazy ? { lazy: true } : {})} src={imageSrc} size={size} alt={alt} title={title} />
            <AbsoluteStyledTP upperCase size="2rem">
                {text}
            </AbsoluteStyledTP>
        </StyledLink>
    );
};

const StyledLink = styled(Link)<{ hover?: number; size: string }>`
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

    ${({ hover, theme }) =>
        hover === 1 &&
        `
        p { display: block; }
        @media (min-width: ${theme.breakpoints.sm}) {
            p { display: none; }
            :hover p { display: block; }
        }
    `}
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
