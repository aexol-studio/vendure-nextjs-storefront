import React, { useEffect, useMemo, useState } from 'react';
import { Stack, ProductImage, ImageSwitcherArrow } from '@/src/components/atoms';
import styled from '@emotion/styled';
import { ImageOff } from 'lucide-react';
type Asset = { source: string; preview: string } | undefined;

interface ProductPhotosPreview {
    featuredAsset: Asset;
    name?: string;
    images?: Asset[];
}

export const ProductPhotosPreview: React.FC<ProductPhotosPreview> = ({ featuredAsset, images, name }) => {
    const [chosenImage, setChosenImage] = useState<Asset>(featuredAsset ?? images?.[0]);

    useEffect(() => {
        if (typeof featuredAsset === 'undefined' && typeof images === 'undefined' && typeof chosenImage === 'undefined')
            return;
        setChosenImage(featuredAsset ?? images?.[0]);
    }, [featuredAsset, images]);

    const handleArrowClick = (forward?: boolean) => {
        const chosenImageIndex = images?.findIndex(image => chosenImage?.source === image?.source);
        if (typeof chosenImageIndex === 'undefined') return;
        if (forward) {
            setChosenImage(images?.[chosenImageIndex + 1]);
            return;
        }
        setChosenImage(images?.[chosenImageIndex - 1]);
    };

    const chosenImageIndex = useMemo(
        () => images?.findIndex(image => chosenImage?.source === image?.source),
        [images, chosenImage],
    );

    return (
        <Wrapper gap="3rem">
            <AssetBrowser column gap="1.75rem">
                {images?.map(a => {
                    const isSelected = chosenImage?.source === a?.source;
                    return (
                        <StyledProductImage
                            key={a?.preview}
                            size="thumbnail"
                            src={a?.preview}
                            onClick={() => setChosenImage(a)}
                            isSelected={isSelected}
                            alt={name}
                            title={name}
                        />
                    );
                })}
            </AssetBrowser>
            {chosenImage ? (
                <ProductImageContainer>
                    <ImageSwitcherArrow handleClick={() => handleArrowClick()} disabled={chosenImageIndex === 0} />
                    <ProductImage size="detail" src={chosenImage.preview} alt={name} title={name} />
                    <ImageSwitcherArrow
                        handleClick={() => handleArrowClick(true)}
                        disabled={chosenImageIndex === (images?.length ?? 1) - 1}
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
