import { ProductDetailType } from '@/src/graphql/selectors';

export type Variant = ProductDetailType['variants'][number];

export type ProductContainerType = {
    product?: ProductDetailType;
    variant?: Variant;
    addingError?: string;
    handleVariant: (variant?: Variant) => void;
    handleAddToCart: () => void;
    handleBuyNow: () => void;
};
