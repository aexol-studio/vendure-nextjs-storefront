import React, { useCallback, useState } from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { ProductImage } from '../atoms/ProductImage';
import { ImageOff } from 'lucide-react';
import { ImageSwitcherArrow } from '../atoms/ImageSwitcherArrow';
type Asset = { source: string; preview: string } | undefined;

interface ProductPhotosPreview {
    featuredAsset: Asset;
    images?: Asset[];
}

export const ProductPhotosPreview: React.FC<ProductPhotosPreview> = ({ featuredAsset, images }) => {
    const [choosenImage, setChoosenImage] = useState<Asset>(featuredAsset ?? images?.[0]);

    const isArrowDisabled = useCallback(
        (forward?: boolean) => {
            if (!choosenImage || !images) return true;

            const choosenImageIndex = images.findIndex(image => choosenImage?.source === image?.source);

            if (forward) return choosenImageIndex === images.length - 1;
            return choosenImageIndex === 0;
        },
        [images, choosenImage],
    );

    const handleArrowClick = (forward?: boolean) => {
        const choosenImageIndex = images?.findIndex(image => choosenImage?.source === image?.source);

        if (typeof choosenImageIndex === 'undefined') return;

        if (forward) {
            setChoosenImage(images?.[choosenImageIndex + 1]);
            return;
        }
        setChoosenImage(images?.[choosenImageIndex - 1]);
    };

    return (
        <Wrapper gap="3rem">
            <AssetBrowser column gap="1.75rem">
                {images?.map(a => {
                    const isSelected = choosenImage?.source === a?.source;
                    return (
                        <StyledProductImage
                            key={a?.preview}
                            size="thumbnail"
                            src={a?.preview}
                            onClick={() => setChoosenImage(a)}
                            isSelected={isSelected}
                        />
                    );
                })}
            </AssetBrowser>
            {choosenImage ? (
                <ProductImageContainer>
                    <ImageSwitcherArrow handleClick={() => handleArrowClick()} disabled={isArrowDisabled()} />
                    <ProductImage size="detail" src={choosenImage.preview} />
                    <ImageSwitcherArrow
                        handleClick={() => handleArrowClick(true)}
                        disabled={isArrowDisabled(true)}
                        right
                    />
                </ProductImageContainer>
            ) : (
                <NoImage size="60rem" />
            )}
        </Wrapper>
    );
};

const Wrapper = styled(Stack)`
    flex-direction: column-reverse;
    align-items: center;
    @media (min-width: 1024px) {
        flex-direction: row;
    }
`;

const StyledProductImage = styled(ProductImage)<{ isSelected: boolean }>`
    cursor: pointer;
    opacity: ${({ isSelected }) => (isSelected ? '100%' : '40%')};
    :hover {
        opacity: 100%;
    }
`;

const ProductImageContainer = styled.div`
    position: relative;
    width: max-content;
`;

const AssetBrowser = styled(Stack)`
    flex-direction: row;
    max-width: 52rem;
    overflow-x: scroll;
    padding-bottom: 1rem;
    @media (min-width: 1024px) {
        flex-direction: column;
        max-height: 60rem;
        overflow-y: scroll;
        padding-bottom: 0;
        padding-right: 1rem;
    }
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
const NoImage = styled(ImageOff)`
    color: ${p => p.theme.gray(50)};
`;
