import { NewestProductType } from '@/src/graphql/selectors';
import React from 'react';
import { TH2, Stack } from '@/src/components/atoms';

import { useTranslation } from 'next-i18next';
import { Slider } from './Slider';
import { ProductImageWithInfo } from '@/src/components/molecules/ProductImageWithInfo';

interface NewestProductsProps {
    products: NewestProductType[];
}

export const NewestProducts: React.FC<NewestProductsProps> = ({ products }) => {
    const { t } = useTranslation('common');

    const slides = products.map(product => (
        <ProductImageWithInfo
            size="tile"
            key={product.name}
            href={`/products/${product.slug}`}
            imageSrc={product.featuredAsset?.preview || ''}
            text={product.name || ''}
            withText
        />
    ));

    return (
        <Stack column gap="2rem" style={{ marginBottom: '2rem' }}>
            <TH2>{t('newest-products')}</TH2>
            <Slider withArrows withDots spacing={32} slides={slides} />
        </Stack>
    );
};
