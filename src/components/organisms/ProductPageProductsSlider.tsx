import { ProductVariantTileType } from '@/src/graphql/selectors';
import React from 'react';
import { TH2, Stack } from '@/src/components/atoms';

import { Slider } from '@/src/components/organisms/Slider';
import { ProductVariantTile } from '@/src/components/molecules/ProductVariantTile';

interface ProductPageProductsSliderProps {
    title: string;
    products: ProductVariantTileType[];
}

export const ProductPageProductsSlider: React.FC<ProductPageProductsSliderProps> = ({ products, title }) => {
    if (!products?.length) return null;
    const slides = products.map((variant, index) => <ProductVariantTile lazy key={index} variant={variant} />);

    return (
        <Stack column gap="2rem" style={{ marginBottom: '2rem' }}>
            <TH2>{title}</TH2>
            <Slider withArrows={4} spacing={32} slides={slides} />
        </Stack>
    );
};
