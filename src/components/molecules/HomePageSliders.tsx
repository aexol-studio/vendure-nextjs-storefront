import React from 'react';
import { useTranslation } from 'next-i18next';
import { Stack } from '@/src/components/atoms/Stack';
import { HomePageSlidersType } from '@/src/graphql/selectors';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Slider } from '../organisms/Slider';
import { ProductImageWithInfo } from './ProductImageWithInfo';
import Link from 'next/link';
import styled from '@emotion/styled';

interface BestOfI {
    sliders: HomePageSlidersType[];
}

export const HomePageSliders: React.FC<BestOfI> = ({ sliders }) => {
    const { t } = useTranslation('common');
    return (
        <Stack w100 column>
            {sliders.map(slider => {
                const slides = slider.productVariants.items.map(variant => {
                    const src = variant.featuredAsset?.preview ?? variant.product?.featuredAsset?.preview;
                    return (
                        <Stack column key={variant.name}>
                            <ProductImageWithInfo
                                size="popup"
                                imageSrc={src}
                                href={`/products/${variant.product.slug}?variant=${variant.id}`}
                                alt={variant.name}
                            />
                            <TP>{variant.name}</TP>
                        </Stack>
                    );
                });
                return (
                    <Stack w100 key={slider.slug} column gap="2rem">
                        <Stack w100 justifyBetween>
                            <TH2>{`${slider.name} (${slider.productVariants.totalItems})`}</TH2>
                            <StyledLink href={`/collections/${slider.slug}`}>
                                <TP color="contrast">{t('seeAll')}</TP>
                            </StyledLink>
                        </Stack>
                        <Slider spacing={16} withArrows slides={slides} />
                    </Stack>
                );
            })}
        </Stack>
    );
};

const StyledLink = styled(Link)`
    padding: 1rem 2rem;

    background-color: ${({ theme }) => theme.text.main};
    display: flex;
    align-items: center;
    justify-content: center;
`;
