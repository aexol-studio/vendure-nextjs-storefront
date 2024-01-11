import { optimizeImage } from '@/src/util/optimizeImage';
import styled from '@emotion/styled';
import { ImgHTMLAttributes, forwardRef } from 'react';
import Image, { ImageProps } from 'next/image';

type ImageType = ImgHTMLAttributes<ImageProps & HTMLImageElement> & {
    size: 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' | 'thumbnail-big';
};

export const ProductImage = forwardRef((props: ImageType, ref: React.ForwardedRef<HTMLImageElement>) => {
    const { size, src, alt, ...rest } = props;
    const better_src = optimizeImage({ size, src });

    let width = 200;
    let height = 200;

    switch (size) {
        case 'thumbnail':
            width = 200;
            height = 200;
            break;
        case 'thumbnail-big':
            width = 400;
            height = 400;
            break;
        case 'tile':
            width = 400;
            height = 400;
            break;
        case 'popup':
            width = 600;
            height = 600;
            break;
        case 'detail':
            width = 800;
            height = 800;
            break;
        case 'full':
            width = 1200;
            height = 1200;
            break;
    }

    return (
        <StyledProductImage
            {...rest}
            src={better_src || ''}
            alt={alt || ''}
            width={width}
            height={height}
            placeholder="empty"
            size={size}
            ref={ref}
            quality={100}
        />
    );
});

export const ProductImageGrid = forwardRef(
    (props: ImgHTMLAttributes<ImageProps & HTMLImageElement>, ref: React.ForwardedRef<HTMLImageElement>) => {
        const { src, alt, ...rest } = props;
        const better_src = optimizeImage({ size: 'popup', src });
        return (
            <StyledProductImageGrid
                {...rest}
                src={better_src || ''}
                alt={alt || ''}
                width={600}
                height={600}
                placeholder="empty"
                ref={ref}
                quality={100}
            />
        );
    },
);

const StyledProductImageGrid = styled(Image)`
    width: 100%;
    object-fit: cover;
    height: 48rem;
    flex: 0 0 auto;
`;

export const StyledProductImage = styled(Image)<{
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
