import styled from '@emotion/styled';
import { ProductVariantTileType } from '@/src/graphql/selectors';
import React from 'react';
import { Stack, Price, Link, TP, ProductImage } from '@/src/components/atoms';
import { Button } from './Button';
import { Ratings } from './Ratings';

interface ProductVariantTileProps {
    variant: ProductVariantTileType;
    addToCart?: { text: string; action: (id: string) => Promise<void> };
    lazy?: boolean;
    withoutRatings?: boolean;
    withoutRedirect?: boolean;
    displayAllCategories?: boolean;
}

export const ProductVariantTile: React.FC<ProductVariantTileProps> = ({
    variant,
    addToCart,
    lazy,
    // this is temp until we have ratings
    withoutRatings = true,
    withoutRedirect,
    displayAllCategories,
}) => {
    const src = variant.featuredAsset?.preview ?? variant.product?.featuredAsset?.preview;
    const ImageLink = withoutRedirect ? ImageContainer : LinkContainer;
    const TextWrapper = withoutRedirect ? TextContainer : TextRedirectContainer;

    return (
        <Stack column key={variant.name}>
            <Stack style={{ position: 'relative', width: '32rem' }}>
                <Categories>
                    {variant.product.collections
                        .filter(c => c.slug !== 'all' && c.slug !== 'search')
                        .sort(() => -1)
                        .slice(0, displayAllCategories ? undefined : 1)
                        .map(c => (
                            <CategoryBlock href={`/collections/${c.slug}`} key={c.slug}>
                                <TP size="1.25rem" color="contrast">
                                    {c.name}
                                </TP>
                            </CategoryBlock>
                        ))}
                </Categories>
                <ImageLink href={`/products/${variant.product.slug}?variant=${variant.id}`}>
                    <ProductImage
                        {...(lazy ? { lazy: true } : {})}
                        src={src}
                        size={'popup'}
                        alt={variant.name}
                        title={variant.name}
                    />
                </ImageLink>
            </Stack>
            <Stack column gap="2rem">
                <TextWrapper href={`/products/${variant.product.slug}?variant=${variant.id}`}>
                    <Stack column gap="0.25rem">
                        <TP>{variant.name}</TP>
                        <Price size="1.25rem" price={variant.priceWithTax} currencyCode={variant.currencyCode} />
                    </Stack>
                    {!withoutRatings && <Ratings rating={Math.random() * 5} />}
                </TextWrapper>
                {addToCart ? <Button onClick={() => addToCart.action(variant.id)}>{addToCart.text}</Button> : null}
            </Stack>
        </Stack>
    );
};

const TextContainer = styled(Stack)`
    margin-top: 0.75rem;
`;

const TextRedirectContainer = styled(Link)`
    margin-top: 0.75rem;
`;

const ImageContainer = styled(Stack)`
    position: relative;
`;

const LinkContainer = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CategoryBlock = styled(Link)`
    padding: 1rem;

    background-color: ${({ theme }) => theme.gray(500)};

    @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
        :hover {
            background-color: ${({ theme }) => theme.gray(600)};
        }
    }
`;

const Categories = styled(Stack)`
    position: absolute;
    top: 0;
    left: 0;
    flex-wrap: wrap;
    gap: 1rem;
    z-index: 1;
`;
