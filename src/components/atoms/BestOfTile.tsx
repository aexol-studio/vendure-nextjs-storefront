import React from 'react';
import styled from '@emotion/styled';
import { ProductImageGrid } from '@/src/components/atoms/ProductImage';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';

interface BestOfTileI {
    productName: string;
    desc: string;
    imgSrc: string;
    slug: string;
}

export const BestOfTile: React.FC<BestOfTileI> = ({ desc, imgSrc, productName, slug }) => {
    const { t } = useTranslation('common');
    return (
        <Stack column itemsCenter gap="1rem">
            <ImageWrapper>
                <Image src={imgSrc} />
            </ImageWrapper>
            <TP size="2rem">{productName}</TP>
            <Description>{desc}</Description>
            <Stack style={{ flexGrow: 1, width: '100%' }} itemsEnd>
                <ShopNow href={`/products/${slug}`}>{t('shopNow')}</ShopNow>
            </Stack>
        </Stack>
    );
};

const ImageWrapper = styled(Stack)`
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
const ShopNow = styled(Link)`
    background: ${({ theme }) => theme.gray(800)};
    color: ${({ theme }) => theme.gray(100)};
    flex-grow: 1;
    padding: 1rem 2rem;
    margin-top: 1rem;
    text-align: center;
`;
