import React from 'react';
import { useTranslation } from 'next-i18next';
import { Stack } from '@/src/components/atoms/Stack';
import { HomePageSlidersType } from '@/src/graphql/selectors';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Slider } from '../organisms/Slider';
import Link from 'next/link';
import styled from '@emotion/styled';
import { ProductImage } from '../atoms';

interface BestOfI {
    sliders: HomePageSlidersType[];
}

export const HomePageSliders: React.FC<BestOfI> = ({ sliders }) => {
    const { t } = useTranslation('common');
    return (
        <Stack w100 column>
            {sliders.map((slider, index) => {
                const slides = slider.productVariants.items.map(variant => {
                    const src = variant.featuredAsset?.preview ?? variant.product?.featuredAsset?.preview;
                    return (
                        <Stack column key={variant.name}>
                            <Stack>
                                <Categories>
                                    {variant.product.collections
                                        .filter(c => c.slug !== 'all' && c.slug !== 'search')
                                        .sort(() => -1)
                                        .slice(0, 1)
                                        .map(c => (
                                            <CategoryBlock href={`/collections/${c.slug}`} key={c.slug}>
                                                <TP size="1.25rem" color="contrast">
                                                    {c.name}
                                                </TP>
                                            </CategoryBlock>
                                        ))}
                                </Categories>
                                <Link href={`/products/${variant.product.slug}?variant=${variant.id}`}>
                                    <ProductImage
                                        {...(index > 0 ? { lazy: true } : {})}
                                        src={src}
                                        size={'popup'}
                                        alt={variant.name}
                                        title={variant.name}
                                    />
                                </Link>
                            </Stack>
                            <Link href={`/products/${variant.product.slug}?variant=${variant.id}`}>
                                <TP>{variant.name}</TP>
                            </Link>
                        </Stack>
                    );
                });
                return (
                    <StyledSection key={slider.slug}>
                        <Stack w100 justifyBetween>
                            <TH2>{`${slider.name} (${slider.productVariants.totalItems})`}</TH2>
                            <StyledLink href={`/collections/${slider.slug}`}>
                                <TP color="contrast">{t('seeAll')}</TP>
                            </StyledLink>
                        </Stack>
                        <Slider spacing={16} withArrows slides={slides} />
                    </StyledSection>
                );
            })}
        </Stack>
    );
};

const CategoryBlock = styled(Link)`
    padding: 1rem;

    background-color: ${({ theme }) => theme.gray(500)};
`;

const Categories = styled(Stack)`
    position: absolute;
    top: 0;
    left: 0;
    flex-wrap: wrap;
    gap: 1rem;
`;

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
