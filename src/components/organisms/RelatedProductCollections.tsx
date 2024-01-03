import { CollectionTileType } from '@/src/graphql/selectors';
import React from 'react';
import { TH2, Stack } from '@/src/components/atoms';

import { useTranslation } from 'next-i18next';
import { Slider } from './Slider';
import { ProductImageWithInfo } from '@/src/components/molecules/ProductImageWithInfo';

interface RelatedProductCollectionsProps {
    collections?: CollectionTileType[];
}

export const RelatedProductCollections: React.FC<RelatedProductCollectionsProps> = ({ collections }) => {
    const { t } = useTranslation('common');
    if (!collections?.length) return null;

    const slides = collections.map(collection => (
        <ProductImageWithInfo
            size="tile"
            key={collection.id}
            href={`/collections/${collection.slug}`}
            imageSrc={collection.featuredAsset?.preview || ''}
            text={collection.name || ''}
            withHover
        />
    ));

    return (
        <Stack column gap="2rem">
            <TH2>{t('related-collections')}</TH2>
            <Slider withDots spacing={16} slides={slides} />
        </Stack>
    );
};
