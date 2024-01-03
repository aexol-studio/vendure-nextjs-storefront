import { useRef, useCallback, useEffect } from 'react';
import { ItemProps, ItemRef } from '../types';
import styled from '@emotion/styled';

export const GalleryItem: React.FC<ItemProps> = ({ set, remove, open, ...rest }) => {
    if (!set || !remove || !open) return null;

    const ref = useRef<HTMLElement>() as ItemRef;
    const onClick = useCallback(() => open(ref), [ref]);

    useEffect(() => {
        if (!ref.current) return;
        const { offsetHeight, offsetWidth } = ref.current;
        set(ref, {
            ...rest,
            width: offsetWidth * 1.5,
            height: offsetHeight * 1.5,
        });
        return () => remove(ref);
    }, Object.values(rest));

    return (
        <Figure onClick={onClick} ref={ref}>
            <img src={rest.src} alt={rest.alt} />
        </Figure>
    );
};

const Figure = styled.figure`
    margin: 0;
    width: 49.5%;
    padding: 0.5rem;

    cursor: pointer;

    & > img {
        width: 100%;
        height: auto;
    }
`;
