import { ActiveOrderType } from '@/src/graphql/selectors';

export type CheckoutContainerType = {
    activeOrder?: ActiveOrderType;
    changeShippingMethod: (id: string) => Promise<void>;
    applyCouponCode: (code: string) => Promise<boolean>;
    removeCouponCode: (code: string) => Promise<void>;

    addToCheckout: (id: string, q: number) => void;
    removeFromCheckout: (id: string) => void;
    changeQuantity: (id: string, q: number) => void;
};
