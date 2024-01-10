import { NewestProductType } from '@/src/graphql/selectors';
import React from 'react';
import { TH2, Stack, TP } from '@/src/components/atoms';

import { useTranslation } from 'next-i18next';
import { Slider } from './Slider';
import { ProductImageWithInfo } from '@/src/components/molecules/ProductImageWithInfo';

interface NewestProductsProps {
    products: NewestProductType[];
}

export const NewestProducts: React.FC<NewestProductsProps> = ({ products }) => {
    const { t } = useTranslation('common');

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
            <TH2>{t('newest-products')}</TH2>
            <Slider withArrows withDots spacing={32} slides={slides} />
        </Stack>
    );
};
