import React, { useState } from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { ProductImage } from '../atoms/ProductImage';
import { ImageOff } from 'lucide-react';
type Asset = { source: string; preview: string } | undefined;

interface ProductPhotosPreview {
    featuredAsset?: Asset;
    images?: Asset[];
}

export const ProductPhotosPreview: React.FC<ProductPhotosPreview> = ({ featuredAsset, images }) => {
    const [choosenImage, setChoosenImage] = useState<Asset>(featuredAsset ?? images?.[0]);

    return (
        <Stack gap="3rem">
            <AssetBrowser column gap="1.75rem">
                {images?.map(a => {
                    const isSelected = choosenImage?.source === a?.source;
                    return (
                        <ProductImageContainer key={a?.preview}>
                            <StyledProductImage
                                size="thumbnail"
                                src={a?.preview}
                                onClick={() => setChoosenImage(a)}
                                isSelected={isSelected}
                            />
                        </ProductImageContainer>
                    );
                })}
            </AssetBrowser>
            {choosenImage ? <ProductImage size="detail" src={choosenImage.preview} /> : <NoImage size="60rem" />}
        </Stack>
    );
};

const StyledProductImage = styled(ProductImage)<{ isSelected: boolean }>`
    cursor: pointer;
    opacity: ${({ isSelected }) => (isSelected ? '100%' : '40%')};
    :hover {
        opacity: 100%;
    }
`;

const ProductImageContainer = styled.div`
    position: relative;
`;

const AssetBrowser = styled(Stack)`
    width: 10rem;
    max-height: 60rem;
    overflow-y: scroll;

    ::-webkit-scrollbar {
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
const NoImage = styled(ImageOff)`
    color: ${p => p.theme.gray(50)};
`;
