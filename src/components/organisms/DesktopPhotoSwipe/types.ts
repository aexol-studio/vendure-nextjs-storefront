import { MutableRefObject } from 'react';

export type InputObject = Record<string, string | number | undefined>;
export type InternalItem = Omit<ItemProps, 'children'>;
export type ItemRef = MutableRefObject<HTMLElement>;

export interface InternalAPI {
    remove: (ref: ItemRef) => void;
    set: (ref: ItemRef, data: InternalItem) => void;
    open: (ref?: ItemRef | null, targetId?: string | null, itemIndex?: number | null) => void;
}
export type ItemProps = {
    set?: InternalAPI['set'];
    remove?: InternalAPI['remove'];
    open?: InternalAPI['open'];
    src?: string;
    width?: string | number;
    height?: string | number;
    alt?: string;
    id?: string | number;
};

export type PhotoSwipeImage = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
};
