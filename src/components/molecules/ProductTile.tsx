import { Stack, Link, ProductImageGrid, TP } from '@/src/components/atoms/';
import { CollectionTileType, ProductSearchType } from '@/src/graphql/selectors';
import { priceFormatter } from '@/src/util/priceFormatter';
import styled from '@emotion/styled';
import React from 'react';

export const ProductTile: React.FC<{
    product: ProductSearchType;
    collections: CollectionTileType[];
    lazy?: boolean;
}> = ({ product, collections, lazy }) => {
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
        <Main column gap="1rem">
            <Link href={`/products/${product.slug}/`}>
                <ProductImageGrid
                    loading={lazy ? 'lazy' : undefined}
                    src={product.productAsset?.preview}
                    alt={product.productName}
                    title={product.productName}
                />
            </Link>
            <Categories gap="0.5rem">
                {product.collectionIds
                    .filter((cId, index) => product.collectionIds.indexOf(cId) === index)
                    .map(cId => collections.find(c => c.id === cId))
                    .filter(c => c && c.slug !== 'all' && c.slug !== 'search')
                    .map(c => {
                        const href =
                            c?.parent?.slug !== '__root_collection__'
                                ? `/collections/${c?.parent?.slug}/${c?.slug}`
                                : `/collections/${c?.slug}`;

                        return (
                            <CategoryBlock href={href} key={c?.slug}>
                                <TP
                                    size="1.25rem"
                                    color="contrast"
                                    upperCase
                                    weight={500}
                                    style={{ letterSpacing: '0.5px' }}>
                                    {c?.name}
                                </TP>
                            </CategoryBlock>
                        );
                    })}
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

const CategoryBlock = styled(Link)`
    padding: 1rem;

    background-color: ${({ theme }) => theme.tile.background};

    @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
        :hover {
            background-color: ${({ theme }) => theme.gray(500)};
        }
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

    @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
        max-width: 35.5rem;
    }
`;
