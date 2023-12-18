import { Price } from '@/src/components/atoms/Price';
import { Stack } from '@/src/components/atoms/Stack';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { YAMLProductsType } from '@/src/graphql/selectors';
import { useCart } from '@/src/state/cart';
import { CurrencyCode } from '@/src/zeus';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import React, { useState } from 'react';

interface YMALProps {
    YMALProducts: YAMLProductsType[];
    currencyCode: CurrencyCode;
}

export const YMALCarousel: React.FC<YMALProps> = ({ YMALProducts, currencyCode }) => {
    const { t } = useTranslation('checkout');
    const { addToCart } = useCart();
    // JUST SHOWCASE
    return (
        <YMALWrapper w100 column gap="1.25rem">
            <TH2 size="2rem" weight={600}>
                {t('orderSummary.YMAL.title')}
            </TH2>
            <OverflowedStack w100 justifyBetween>
                {YMALProducts.map(product => {
                    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

                    return (
                        <Slide key={product.id}>
                            <Stack column>
                                <ImageWrapper>
                                    <img
                                        src={
                                            selectedVariant?.assets?.length > 0
                                                ? selectedVariant?.assets[0]?.preview
                                                : product.featuredAsset?.preview
                                        }
                                    />
                                </ImageWrapper>
                                <Stack column gap="0.25rem">
                                    <TP style={{ textAlign: 'center' }} size="1.5rem" weight={400}>
                                        {product.name}
                                    </TP>
                                    <Price
                                        price={selectedVariant.priceWithTax}
                                        // beforePrice={selectedVariant.customFields?.beforePrice}
                                        currencyCode={currencyCode}
                                    />
                                    {product.variants.length > 1 ? (
                                        <StyledSelect
                                            value={selectedVariant.id}
                                            onChange={e => {
                                                const variant = product.variants.find(v => v.id === e.target.value);
                                                if (!variant) return;
                                                setSelectedVariant(variant);
                                            }}>
                                            {product.variants.map(variant => (
                                                <option
                                                    disabled={variant.stockLevel !== 'IN_STOCK'}
                                                    key={variant.id}
                                                    value={variant.id}>
                                                    {variant.name.replace(product.name, '')}
                                                </option>
                                            ))}
                                        </StyledSelect>
                                    ) : null}
                                </Stack>
                            </Stack>
                            <Button onClick={() => addToCart(selectedVariant.id, 1)}>
                                {t('orderSummary.YMAL.addToCart')}
                            </Button>
                        </Slide>
                    );
                })}
            </OverflowedStack>
        </YMALWrapper>
    );
};

const ImageWrapper = styled.div`
    width: 16rem;
    height: 16rem;
    overflow: hidden;

    & > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const Slide = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border: 1px solid ${p => p.theme.gray(100)};
    border-radius: 0.5rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-in-out;

    :hover {
        border-color: ${p => p.theme.gray(400)};
        box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
    }
`;

const OverflowedStack = styled(Stack)`
    max-width: 65.5rem;
    overflow-x: scroll;

    gap: 1.5rem;
    padding: 1rem 0.5rem;
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

const StyledSelect = styled.select`
    width: 100%;
    padding: 0.5rem 0.75rem;
    color: ${p => p.theme.gray(900)};
    border: 1px solid ${p => p.theme.gray(100)};
    :focus {
        border-color: ${p => p.theme.gray(400)};
    }
    outline: none;

    text-transform: capitalize;

    & > option {
        text-transform: capitalize;

        &:disabled {
            color: ${p => p.theme.gray(400)};
        }
    }
`;

const YMALWrapper = styled(Stack)`
    margin-top: 2rem;
`;
