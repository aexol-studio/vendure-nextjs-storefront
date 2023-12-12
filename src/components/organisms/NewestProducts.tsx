import { NewestProductType } from '@/src/graphql/selectors';
import React from 'react';
import { Stack } from '../atoms/Stack';
import { TH2 } from '../atoms/TypoGraphy';
import styled from '@emotion/styled';

import { useTranslation } from 'react-i18next';
import { ProductImageWithInfo } from '../molecules/ProductImageWithInfo';

interface NewesProductsProps {
    products: NewestProductType[];
}

export const NewestProducts: React.FC<NewesProductsProps> = ({ products }) => {
    const { t } = useTranslation('common');
    return (
        <Stack column gap="1rem" style={{ marginBottom: '2rem' }}>
            <TH2>{t('newest-products')}</TH2>
            <StyledStack gap="2rem">
                {products.map(p => (
                    <ProductImageWithInfo
                        imageSrc={p.featuredAsset?.preview}
                        size="popup"
                        key={p.name}
                        href={`/products/${p.slug}`}
                        text={p.name}
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
