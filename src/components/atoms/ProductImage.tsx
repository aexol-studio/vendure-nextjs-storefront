import styled from '@emotion/styled';

export const ProductImage = styled.img<{ size: 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' }>`
    height: ${p =>
        p.size === 'tile' ? '36rem' : p.size === 'popup' ? '48rem' : p.size === 'detail' ? '65rem' : '8rem'};
    width: ${p =>
        p.size === 'tile' ? '24rem' : p.size === 'popup' ? '32rem' : p.size === 'detail' ? '54rem' : '8rem'};
    object-fit: cover;
    flex: 0 0 auto;
`;

export const ProductImageGrid = styled.img`
    width: 100%;
    object-fit: cover;
    height: 48rem;
    flex: 0 0 auto;
`;
