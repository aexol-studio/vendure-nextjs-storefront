import { CollectionTileType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';
import React from 'react';
import { Stack, TP } from '@/src/components/atoms';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import { ProductCard } from './ProductCard';

export const ProductsSellout: React.FC<{ collection: RootNode<CollectionTileType>['children'][number] }> = ({
    collection,
}) => {
    const { t } = useTranslation('common');
    return (
        <Stack column>
            <TP size="1.5rem" weight={500}>
                {t('featured-products')}
            </TP>
            <SliderWrapper gap="2.5rem">
                {collection.children.slice(0, 2).map(children => (
                    <Stack key={children.name + '2'}>
                        {children.productVariants.items.map(variant => (
                            <ProductCard key={variant.id} variant={variant} />
                        ))}
                    </Stack>
                ))}
            </SliderWrapper>
        </Stack>
    );
};

const SliderWrapper = styled(Stack)`
    padding: 1.5rem 0;
`;
