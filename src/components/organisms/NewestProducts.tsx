import { NewestProductType } from '@/src/graphql/selectors';
import React from 'react';
import { TH2, Stack, TP } from '@/src/components/atoms';

import { Slider } from './Slider';
import { ProductImageWithInfo } from '@/src/components/molecules/ProductImageWithInfo';

interface NewestProductsProps {
    title: string;
    products: NewestProductType[];
}

export const NewestProducts: React.FC<NewestProductsProps> = ({ products, title }) => {
    const slides = products.map(product => (
        <Stack column gap="1rem" itemsCenter key={product.name}>
            <ProductImageWithInfo
                size="tile"
                href={`/products/${product.slug}`}
                imageSrc={product.featuredAsset?.preview || ''}
                alt={product.name}
                title={product.name}
            />
            <TP>{product.name}</TP>
        </Stack>
    ));

    return (
        <Stack column gap="2rem" style={{ marginBottom: '2rem' }}>
            <TH2>{title}</TH2>
            <Slider withArrows withDots spacing={32} slides={slides} />
        </Stack>
    );
};
