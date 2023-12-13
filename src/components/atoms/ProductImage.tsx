import styled from '@emotion/styled';

export const ProductImage = styled.img<{
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
                  ? '20rem'
                  : '8rem'};
    width: ${p =>
        p.size === 'tile'
            ? '24rem'
            : p.size === 'popup'
              ? '32rem'
              : p.size === 'detail'
                ? '52rem'
                : p.size === 'thumbnail-big'
                  ? '20rem'
                  : '8rem'};
    object-fit: cover;
    flex: 0 0 auto;
    ${({ theme }) => `border-radius: ${theme.borderRadius}`}
`;

export const ProductImageGrid = styled.img`
    width: 100%;
    object-fit: cover;
    height: 48rem;
    flex: 0 0 auto;
`;
