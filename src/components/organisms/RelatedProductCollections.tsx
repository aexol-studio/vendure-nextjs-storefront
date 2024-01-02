import { CollectionTileType } from '@/src/graphql/selectors';
import React from 'react';
import { TH2, Stack } from '@/src/components/atoms';
import { ProductImageWithInfo } from '@/src/components/molecules/ProductImageWithInfo';

import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';

interface RelatedProductCollectionsProps {
    collections?: CollectionTileType[];
}

export const RelatedProductCollections: React.FC<RelatedProductCollectionsProps> = ({ collections }) => {
    const { t } = useTranslation('common');
    return (
        <Stack column gap="1rem">
            <TH2>{t('related-collections')}</TH2>
            <StyledStack gap="2rem">
                {collections?.map(col => (
                    <ProductImageWithInfo
                        key={col.name}
                        href={`/collections/${col.slug}`}
                        imageSrc={col.featuredAsset?.preview}
                        size="popup"
                        text={col.name}
                    />
                ))}
            </StyledStack>
        </Stack>
    );
};

const StyledStack = styled(Stack)`
    overflow-x: scroll;
    ::-webkit-scrollbar {
        height: 0.8rem;
        width: 0.8rem;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: ${p => p.theme.gray(200)};
        border-radius: 1rem;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: ${p => p.theme.gray(400)};
    }
`;
