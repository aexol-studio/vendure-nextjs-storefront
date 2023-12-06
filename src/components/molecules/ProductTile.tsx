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
            <Stack justifyBetween gap="1rem">
                <Stack column gap="0.5rem">
                    <Link href={`/products/${product.slug}/`}>
                        <ProductName>{product.name}</ProductName>
                    </Link>
                    <Stack gap="0.5rem">
                        {product.collections.map(c => (
                            <ProductCategory href={`/collections/${c.slug}/`} key={c.slug}>
                                {c.name}
                            </ProductCategory>
                        ))}
                    </Stack>
                </Stack>
                <ProductPrice gap="1rem">
                    <ProductPriceValue>{product.variants[0].price}</ProductPriceValue>
                    <ProductPriceCurrency>{product.variants[0].currencyCode}</ProductPriceCurrency>
                </ProductPrice>
            </Stack>
        </Main>
    );
};

const ProductName = styled.div`
    font-weight: 700;
`;
const ProductCategory = styled(Link)`
    font-weight: 700;
    opacity: 0.5;
    color: ${p => p.theme.gray(500)};
    :hover {
        color: ${p => p.theme.gray(900)};
    }
`;
const ProductPrice = styled(Stack)`
    font-size: 1.75rem;
`;
const ProductPriceCurrency = styled(Stack)`
    font-weight: 900;
`;
const ProductPriceValue = styled(Stack)`
    font-weight: 900;
`;
const Main = styled(Stack)`
    padding: 1rem;
    font-size: 1.5rem;
    font-weight: 500;
    a {
        color: ${p => p.theme.gray(900)};
    }
`;
