import { ProductDetailType } from '@/src/graphql/selectors';
import { ProductContainerType } from '@/src/state/product/types';

export const productEmptyState: ProductContainerType = {
    product: undefined,
    variant: undefined,
    addingError: undefined,
    handleVariant: () => {},
    handleAddToCart: () => {},
    handleBuyNow: () => {},
    handleOptionClick: () => {},
    productOptionsGroups: [],
};

export const findRelatedVariant = (
    product: Omit<ProductDetailType, 'optionGroups'>,
    group: ProductDetailType['optionGroups'][0],
    option: ProductDetailType['optionGroups'][0]['options'][0],
    selectedOptions: { [key: string]: string },
) => {
    return product.variants.find(v =>
        v.options.every(vo => {
            if (vo.groupId === group.id) return vo.id === option.id;
            return selectedOptions[vo.groupId] === vo.id;
        }),
    );
};

export const setRecentlyViewedInCookie = (cookie: string, productId: string) => {
    const recentlyViewed = cookie.replace('recentlyViewed=', '').split(',');
    const index = recentlyViewed.findIndex(id => id === productId);
    if (index !== -1) recentlyViewed.splice(index, 1);
    recentlyViewed.unshift(productId);
    return recentlyViewed.slice(0, 10).join(',');
};
