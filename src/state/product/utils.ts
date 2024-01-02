import { ProductContainerType } from '@/src/state/product/types';

export const productEmptyState: ProductContainerType = {
    product: undefined,
    variant: undefined,
    addingError: undefined,
    handleVariant: () => {},
    handleAddToCart: () => {},
    handleBuyNow: () => {},
};
