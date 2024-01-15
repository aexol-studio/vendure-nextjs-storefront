import { ActiveOrderType } from '@/src/graphql/selectors';

export type CheckoutContainerType = {
    activeOrder?: ActiveOrderType;
    changeShippingMethod: (id: string) => Promise<void>;
    applyCouponCode: (code: string) => Promise<boolean>;
    removeCouponCode: (code: string) => Promise<void>;

    addToCheckout: (id: string, q: number) => Promise<void>;
    removeFromCheckout: (id: string) => Promise<void>;
    changeQuantity: (id: string, q: number) => Promise<void>;
};
