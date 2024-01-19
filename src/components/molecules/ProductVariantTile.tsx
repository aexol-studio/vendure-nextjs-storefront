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
    const CategoryWrapper = withoutRedirect ? CategoryBlock : CategoryLinkBlock;

    return (
        <Stack column key={variant.name} gap="0.5rem">
            <Stack style={{ position: 'relative', width: '32rem' }}>
                <Categories>
                    {variant.product.collections
                        .filter(c => c.slug !== 'all' && c.slug !== 'search')
                        .sort(() => -1)
                        .slice(0, displayAllCategories ? undefined : 1)
                        .map(c => {
                            const href =
                                c?.parent?.slug !== '__root_collection__'
                                    ? `/collections/${c?.parent?.slug}/${c?.slug}`
                                    : `/collections/${c?.slug}`;
                            return (
                                <CategoryWrapper href={href} key={c.slug}>
                                    <TP
                                        size="1.25rem"
                                        color="contrast"
                                        upperCase
                                        weight={500}
                                        style={{ letterSpacing: '0.5px' }}>
                                        {c.name}
                                    </TP>
                                </CategoryWrapper>
                            );
                        })}
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
                    <Stack column gap="0.5rem">
                        <TP>{variant.name}</TP>
                        <Price price={variant.priceWithTax} currencyCode={variant.currencyCode} />
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

const CategoryBlock = styled(Stack)`
    padding: 1rem;
    background-color: ${({ theme }) => theme.tile.background};
`;

const CategoryLinkBlock = styled(Link)`
    padding: 1rem;

    background-color: ${({ theme }) => theme.tile.background};

    @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
        :hover {
            background-color: ${({ theme }) => theme.tile.hover};
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
