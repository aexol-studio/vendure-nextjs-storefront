import React from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { HomePageSlidersType } from '@/src/graphql/selectors';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Slider } from '@/src/components/organisms/Slider';
import styled from '@emotion/styled';
import { Link } from '@/src/components/atoms';
import { ProductVariantTile } from '@/src/components/molecules/ProductVariantTile';

interface BestOfI {
    sliders: HomePageSlidersType[];
    seeAllText: string;
}

export const HomePageSliders: React.FC<BestOfI> = ({ sliders, seeAllText }) => {
    if (!sliders?.length) return null;
    return (
        <Stack w100 column gap="6rem">
            {sliders.map(slider => {
                const slides = slider.productVariants.items.map((variant, index) => (
                    <ProductVariantTile key={index} variant={variant} lazy={index > 0} />
                ));
                if (!slides.length) return null;
                return (
                    <StyledSection key={slider.slug}>
                        <Stack w100 justifyBetween>
                            <TH2>{`${slider.name} (${slider.productVariants.totalItems})`}</TH2>
                            <StyledLink href={`/collections/${slider.slug}`}>
                                <TP color="contrast">{seeAllText}</TP>
                            </StyledLink>
                        </Stack>
                        <Slider spacing={16} withArrows={4} slides={slides} />
                    </StyledSection>
                );
            })}
        </Stack>
    );
};

const StyledSection = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const StyledLink = styled(Link)`
    padding: 1rem 2rem;

    background-color: ${({ theme }) => theme.text.main};
    display: flex;
    align-items: center;
    justify-content: center;
`;