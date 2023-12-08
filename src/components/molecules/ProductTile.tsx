import { Link } from '@/src/components/atoms/Link';
import { ProductImageGrid } from '@/src/components/atoms/ProductImage';
import { Stack } from '@/src/components/atoms/Stack';
import { ProductTileType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import React from 'react';

export const ProductTile: React.FC<{
    product: ProductTileType;
}> = ({ product }) => {
    return (
        <Main column gap="2rem">
            <Link href={`/products/${product.slug}/`}>
                <ProductImageGrid src={product.featuredAsset?.source} />
            </Link>
            <Categories gap="0.5rem">
                {product.collections.map(c => (
                    <ProductCategory href={`/collections/${c.slug}/`} key={c.slug}>
                        {c.name}
                    </ProductCategory>
                ))}
            </Categories>
            <Stack column gap="0.25rem">
                <Stack column gap="0.5rem">
                    <Link href={`/products/${product.slug}/`}>
                        <ProductName>{product.name}</ProductName>
                    </Link>
                </Stack>
                <ProductPrice gap="0.25rem">
                    <ProductPriceValue>{product.variants[0].price.toFixed(2)}</ProductPriceValue>
                    <ProductPriceCurrency>{product.variants[0].currencyCode}</ProductPriceCurrency>
                </ProductPrice>
            </Stack>
        </Main>
    );
};
const Categories = styled(Stack)`
    position: absolute;
    top: 0;
    left: 0;
    flex-wrap: wrap;
`;

const ProductName = styled.div`
    font-weight: 400;
    color: ${p => p.theme.gray(900)};
    font-size: 1.5rem;
`;
const ImageLink = styled(Link);
const ProductCategory = styled(Link)`
    font-weight: 600;
    text-transform: uppercase;
    font-size: 1rem;
    padding: 0.5rem;
    color: ${p => p.theme.gray(0)};
    background: ${p => p.theme.gray(500)};
    :hover {
        color: ${p => p.theme.gray(900)};
    }
`;
const ProductPrice = styled(Stack)`
    font-size: 1.25rem;
`;
const ProductPriceCurrency = styled(Stack)`
    font-weight: 400;
`;
const ProductPriceValue = styled(Stack)`
    font-weight: 400;
`;
const Main = styled(Stack)`
    font-size: 1.5rem;
    position: relative;
    width: 100%;
    font-weight: 500;
`;
