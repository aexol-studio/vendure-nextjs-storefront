import { Stack } from '@/src/components/atoms/Stack';
import { TH2 } from '@/src/components/atoms/TypoGraphy';
import { ProductVariantTile } from '@/src/components/molecules/ProductVariantTile';
import { Slider } from '@/src/components/organisms/Slider';
import { ProductVariantTileType } from '@/src/graphql/selectors';
import { useCheckout } from '@/src/state/checkout';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import React from 'react';

interface CheckoutCarouselProps {
    alsoBoughtProducts: ProductVariantTileType[] | null;
}
export const CheckoutCarousel: React.FC<CheckoutCarouselProps> = ({ alsoBoughtProducts }) => {
    if (!alsoBoughtProducts?.length) return null;
    const { addToCheckout } = useCheckout();
    const { t } = useTranslation('checkout');

    const slides = alsoBoughtProducts.map(variant => {
        return (
            <ProductVariantTile
                lazy
                withoutRedirect
                variant={variant}
                key={variant.id}
                addToCart={{
                    text: t('orderSummary.customerAlsoBought.addToOrder'),
                    action: async id => await addToCheckout(id, 1),
                }}
            />
        );
    });

    return (
        <CheckoutCarouselWrapper w100 column gap="1.25rem">
            <TH2 size="2rem" weight={600}>
                {t('orderSummary.customerAlsoBought.title')}
            </TH2>
            <Slider slides={slides} spacing={16} />
        </CheckoutCarouselWrapper>
    );
};

const CheckoutCarouselWrapper = styled(Stack)`
    margin: 2rem 0 4rem 0;
`;
