import styled from '@emotion/styled';
import { ImgHTMLAttributes, forwardRef } from 'react';

type ImageType = ImgHTMLAttributes<HTMLImageElement> & {
    size: 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' | 'thumbnail-big';
};

export const ProductImage = forwardRef((props: ImageType, ref: React.ForwardedRef<HTMLImageElement>) => {
    const { size, src, ...rest } = props;

    let better_src = src;
    switch (size) {
        case 'thumbnail':
            better_src = src + '?w=200&h=200&mode=crop&format=webp';
            break;
        case 'thumbnail-big':
            better_src = src + '?w=400&h=400&mode=resize&format=webp';
            break;
        case 'tile':
            better_src = src + '?w=400&h=400&mode=resize&format=webp';
            break;
        case 'popup':
            better_src = src + '?w=600&h=600&mode=resize&format=webp';
            break;
        case 'detail':
            better_src = src + '?w=800&h=800&mode=resize&format=webp';
            break;
        case 'full':
            better_src = src + '?w=1200&h=1200&mode=resize&format=webp';
            break;
        default:
            break;
    }

    return <StyledProductImage {...rest} src={better_src} size={size} ref={ref} />;
});

export const ProductImageGrid = forwardRef(
    (props: ImgHTMLAttributes<HTMLImageElement>, ref: React.ForwardedRef<HTMLImageElement>) => {
        const { src, ...rest } = props;
        const better_src = src + '?w=600&h=600&mode=resize&format=webp';

        return <StyledProductImageGrid {...rest} src={better_src} ref={ref} />;
    },
);

const StyledProductImageGrid = styled.img`
    width: 100%;
    object-fit: cover;
    height: 48rem;
    flex: 0 0 auto;
`;

export const StyledProductImage = styled.img<{
    size: 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' | 'thumbnail-big';
}>`
    height: ${p =>
        p.size === 'tile'
            ? '36rem'
            : p.size === 'popup'
              ? '48rem'
              : p.size === 'detail'
                ? '60rem'
                : p.size === 'thumbnail-big'
                  ? '16rem'
                  : '8rem'};
    width: ${p =>
        p.size === 'tile'
            ? '24rem'
            : p.size === 'popup'
              ? '32rem'
              : p.size === 'detail'
                ? '52rem'
                : p.size === 'thumbnail-big'
                  ? '16rem'
                  : '8rem'};
    object-fit: cover;
    flex: 0 0 auto;
    ${({ theme }) => `border-radius: ${theme.borderRadius}`}
`;
