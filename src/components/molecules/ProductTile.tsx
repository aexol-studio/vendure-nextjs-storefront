import { Stack, Link, ProductImageGrid } from '@/src/components/atoms/';
import { CollectionTileType, ProductSearchType } from '@/src/graphql/selectors';
import { priceFormatter } from '@/src/util/priceFomatter';
import styled from '@emotion/styled';
import React from 'react';

export const ProductTile: React.FC<{
    product: ProductSearchType;
    collections: CollectionTileType[];
}> = ({ product, collections }) => {
    const priceValue =
        'value' in product.priceWithTax
            ? priceFormatter(product.priceWithTax.value, product.currencyCode)
            : product.priceWithTax.min === product.priceWithTax.max
              ? priceFormatter(product.priceWithTax.min, product.currencyCode)
              : `${priceFormatter(product.priceWithTax.min, product.currencyCode)} - ${priceFormatter(
                    product.priceWithTax.max,
                    product.currencyCode,
                )}`;

    return (
        <Main column gap="2rem">
            <Link href={`/products/${product.slug}/`}>
                <ProductImageGrid
                    src={product.productAsset?.preview}
                    alt={product.productName}
                    title={product.productName}
                />
            </Link>
            <Categories gap="0.5rem">
                {product.collectionIds
                    .filter((cId, index) => product.collectionIds.indexOf(cId) === index)
                    .map(cId => collections.find(c => c.id === cId))
                    .filter(c => c)
                    .map(c => (
                        <ProductCategory href={`/collections/${c?.slug}/`} key={c?.slug}>
                            {c?.name}
                        </ProductCategory>
                    ))}
            </Categories>
            <Stack column gap="0.25rem">
                <Stack column gap="0.5rem">
                    <Link href={`/products/${product.slug}/`}>
                        <ProductName>{product.productName}</ProductName>
                    </Link>
                </Stack>
                <ProductPrice gap="0.25rem">
                    <ProductPriceValue>{priceValue}</ProductPriceValue>
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
// const ImageLink = styled(Link);
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
const ProductPriceValue = styled(Stack)`
    font-weight: 400;
`;
const Main = styled(Stack)`
    font-size: 1.5rem;
    position: relative;
    width: 100%;
    font-weight: 500;
`;
