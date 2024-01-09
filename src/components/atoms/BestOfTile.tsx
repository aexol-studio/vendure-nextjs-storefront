import React from 'react';
import styled from '@emotion/styled';
import { ProductImageGrid } from '@/src/components/atoms/ProductImage';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';
import { Button } from '../molecules/Button';
import { useCart } from '@/src/state/cart';
import { Price } from './Price';
import { CurrencyCode } from '@/src/zeus';

interface BestOfTileI {
    productName: string;
    desc: string;
    imgSrc: string;
    slug: string;
    productVariantId: string;
    productVariantName: string;
    priceWithTax?: number;
    currencyCode: CurrencyCode;
}

export const BestOfTile: React.FC<BestOfTileI> = ({
    desc,
    imgSrc,
    productName,
    slug,
    productVariantId,
    productVariantName,
    priceWithTax,
    currencyCode,
}) => {
    const { t } = useTranslation('common');
    const { addToCart } = useCart();
    const optionInName = productVariantName.replace(productName, '') !== '';

    return (
        <Stack column itemsCenter gap="1rem">
            <ImageWrapper href={`/products/${slug}`}>
                <Image src={imgSrc} />
            </ImageWrapper>
            <Stack w100>
                <TP
                    size="1.5rem"
                    weight={500}
                    style={{
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                    }}>
                    {productName}
                </TP>
                <Stack w100 itemsCenter justifyBetween>
                    {optionInName && (
                        <TP size="1.5rem" weight={400}>
                            {productVariantName.replace(productName, '')}
                        </TP>
                    )}
                </Stack>
                {priceWithTax && <Price price={priceWithTax} currencyCode={currencyCode} />}
            </Stack>
            <Description>{desc}</Description>
            <Stack style={{ flexGrow: 1, width: '100%' }} itemsEnd>
                <Button onClick={e => addToCart(productVariantId, 1, true, e)}>{t('shopNow')}</Button>
            </Stack>
        </Stack>
    );
};

const ImageWrapper = styled(Link)`
    width: 100%;
    height: 42rem;
    overflow: hidden;
`;

const Image = styled(ProductImageGrid)`
    height: 42rem;

    @media (min-width: ${p => p.theme.breakpoints.xl}) {
        transition: all 0.4s ease-in-out;
        :hover {
            transform: scale(1.02);
        }
    }
`;

const Description = styled(TP)`
    text-align: left;

    color: ${({ theme }) => theme.gray(300)};

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
`;
