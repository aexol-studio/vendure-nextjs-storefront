import React from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { Stack } from '@/src/components/atoms/Stack';
import { ProductSearchType } from '@/src/graphql/selectors';
import { TH2 } from '@/src/components/atoms/TypoGraphy';
import { BestOfTile } from '@/src/components/atoms/BestOfTile';
import { MainGrid } from '@/src/components/atoms/MainGrid';

interface BestOfI {
    products: ProductSearchType[];
}

export const BestOf: React.FC<BestOfI> = ({ products }) => {
    const { t } = useTranslation('common');
    return (
        <Container gap="2rem" column>
            <Title>{`${t('bestOf')} 2023`}</Title>
            <MainGrid>
                {products.map(({ slug, productName, productAsset, description }) => (
                    <BestOfTile
                        key={slug}
                        slug={slug}
                        imgSrc={productAsset?.preview ?? ''}
                        desc={description}
                        productName={productName}
                    />
                ))}
            </MainGrid>
        </Container>
    );
};

const Container = styled(Stack)`
    padding-block: 2rem;
`;

const Title = styled(TH2)`
    border-bottom: 1px solid ${p => p.theme.gray(100)};
`;
