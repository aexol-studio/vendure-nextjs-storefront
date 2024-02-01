import React, { useEffect, useState } from 'react';
import { HomePageSlidersType } from '@/src/graphql/selectors';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Slider } from '@/src/components/organisms/Slider';
import styled from '@emotion/styled';
import { Link, Stack } from '@/src/components/atoms';
import { ProductVariantTile } from '@/src/components/molecules/ProductVariantTile';

interface BestOfI {
    sliders: HomePageSlidersType[];
    seeAllText: string;
}

export const HomePageSliders: React.FC<BestOfI> = ({ sliders, seeAllText }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !sliders?.length) return null;
    return (
        <Stack w100 column gap="6rem">
            {sliders.map(slider => {
                const slides = slider?.productVariants?.items?.map((variant, index) => (
                    <ProductVariantTile key={index} variant={variant} lazy={index > 0} />
                ));
                if (!slides?.length) return null;
                const href =
                    slider?.parent?.slug !== '__root_collection__'
                        ? `/collections/${slider?.parent?.slug}/${slider?.slug}`
                        : `/collections/${slider?.slug}`;

                return (
                    <StyledSection key={slider.slug}>
                        <Stack w100 justifyBetween>
                            <TH2>{`${slider.name} (${slider.productVariants.totalItems})`}</TH2>
                            <StyledLink href={href}>
                                <TP upperCase color="contrast" weight={500} style={{ letterSpacing: '0.5px' }}>
                                    {seeAllText}
                                </TP>
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
