import styled from '@emotion/styled';

export const ProductImage = styled.img<{ size: 'thumbnail' | 'tile' | 'popup' | 'detail' | 'full' }>`
    width: ${p =>
        p.size === 'tile' ? '48rem' : p.size === 'popup' ? '64rem' : p.size === 'detail' ? '60rem' : '8rem'};
    height: ${p =>
        p.size === 'tile' ? '24rem' : p.size === 'popup' ? '32rem' : p.size === 'detail' ? '40rem' : '8rem'};
    object-fit: cover;
    border-radius: 2rem;
    flex: 0 0 auto;
`;

export const ProductImageGrid = styled.img`
    height: 24rem;
    width: 100%;
    object-fit: cover;
    border-radius: 2rem;
    flex: 0 0 auto;
`;
