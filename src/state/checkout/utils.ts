import { CheckoutContainerType } from './types';

export const emptyCheckoutState: CheckoutContainerType = {
    activeOrder: undefined,
    changeShippingMethod: async () => {},
    applyCouponCode: async () => false,
    removeCouponCode: async () => {},

    addToCheckout: async () => {},
    removeFromCheckout: async () => {},
    changeQuantity: async () => {},
};
