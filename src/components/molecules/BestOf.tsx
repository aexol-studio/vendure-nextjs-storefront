import React from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import { Stack } from '@/src/components/atoms/Stack';
import { ProductSearchType } from '@/src/graphql/selectors';
import { TH2 } from '@/src/components/atoms/TypoGraphy';
import { BestOfTile } from '@/src/components/atoms/BestOfTile';
import { MainGrid } from '@/src/components/atoms/MainGrid';

interface BestOfI {
    products: (ProductSearchType & {
        productVariantId: string;
        productVariantName: string;
    })[];
}

export const BestOf: React.FC<BestOfI> = ({ products }) => {
    const { t } = useTranslation('common');
    return (
        <Container gap="2rem" column>
            <Title>{`${t('bestOf')} 2024`}</Title>
            <MainGrid style={{ gap: '3rem' }}>
                {products.map(
                    ({
                        slug,
                        productName,
                        productAsset,
                        description,
                        productVariantId,
                        productVariantName,
                        priceWithTax,
                        currencyCode,
                    }) => {
                        return (
                            <BestOfTile
                                key={slug}
                                slug={slug}
                                imgSrc={productAsset?.preview ?? ''}
                                desc={description}
                                productName={productName}
                                productVariantId={productVariantId}
                                productVariantName={productVariantName}
                                priceWithTax={'value' in priceWithTax ? priceWithTax.value : undefined}
                                currencyCode={currencyCode}
                            />
                        );
                    },
                )}
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
