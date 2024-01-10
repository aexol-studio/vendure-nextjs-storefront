import 'photoswipe/dist/photoswipe.css';

import { GalleryItem } from './GalleryItem';
import { useDesktopPhotoSwipe } from './hooks';
import { PhotoSwipeImage } from './types';
import styled from '@emotion/styled';

export function DesktopPhotoSwipe({ galleryID, images }: { galleryID: string; images: PhotoSwipeImage[] }) {
    //TODO: not working - need better use cases
    const { remove, set, open } = useDesktopPhotoSwipe(galleryID, images);

    return (
        <Container>
            <Wrapper>
                {images.slice(0, 6).map(image => (
                    <GalleryItem
                        key={image.src}
                        open={open}
                        set={set}
                        remove={remove}
                        width={image.width}
                        height={image.height}
                        src={image.src}
                    />
                ))}
            </Wrapper>
        </Container>
    );
}

const Container = styled.div`
    display: none;
    position: relative;

    @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
        display: flex;
    }
`;

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
`;
