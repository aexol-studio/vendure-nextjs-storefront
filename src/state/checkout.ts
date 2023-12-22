import { storefrontApiMutation } from '@/src/graphql/client';
import { ActiveOrderSelector, ActiveOrderType } from '@/src/graphql/selectors';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

type CheckoutContainerType = {
    activeOrder?: ActiveOrderType;
    changeShippingMethod: (id: string) => Promise<void>;
    applyCouponCode: (code: string) => Promise<boolean>;
    removeCouponCode: (code: string) => Promise<void>;

    addToCheckout: (id: string, q: number) => void;
    removeFromCheckout: (id: string) => void;
    changeQuantity: (id: string, q: number) => void;
};

//This is the Checkout Store
//It is used to manage the active order on checkout pages
//It looks same as the Cart Store, but it accept an initial state and it has some extra methods
//Prepared for future use *in feature checkout can be different than cart
const useCheckoutContainer = createContainer<CheckoutContainerType, { initialActiveOrder: ActiveOrderType }>(
    initialState => {
        if (!initialState) {
            return {
                activeOrder: undefined,
                changeShippingMethod: async () => {},
                applyCouponCode: async () => false,
                removeCouponCode: async () => {},
                addToCheckout: () => {},
                removeFromCheckout: () => {},
                changeQuantity: () => {},
            };
        }

        const [activeOrder, setActiveOrder] = useState<ActiveOrderType>(initialState.initialActiveOrder);

        const addToCheckout = (id: string, q: number) => {
            setActiveOrder(c => {
                return c && { ...c, totalQuantity: c.totalQuantity + 1 };
            });
            storefrontApiMutation({
                addItemToOrder: [
                    { productVariantId: id, quantity: q },
                    {
                        '...on Order': ActiveOrderSelector,
                        '...on OrderLimitError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on InsufficientStockError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on NegativeQuantityError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on OrderModificationError': {
                            errorCode: true,
                            message: true,
                        },
                        __typename: true,
                    },
                ],
            }).then(r => {
                if (r.addItemToOrder.__typename === 'Order') {
                    setActiveOrder(r.addItemToOrder);
                }
            });
        };

        const removeFromCheckout = (id: string) => {
            setActiveOrder(c => {
                return c && { ...c, lines: c.lines.filter(l => l.id !== id) };
            });
            storefrontApiMutation({
                removeOrderLine: [
                    { orderLineId: id },
                    {
                        '...on Order': ActiveOrderSelector,
                        '...on OrderModificationError': {
                            errorCode: true,
                            message: true,
                        },
                        __typename: true,
                    },
                ],
            }).then(r => {
                if (r.removeOrderLine.__typename === 'Order') {
                    setActiveOrder(r.removeOrderLine);
                    return;
                }
                return r.removeOrderLine;
            });
        };

        const changeQuantity = (id: string, q: number) => {
            setActiveOrder(c => {
                if (c?.lines.find(l => l.id === id)) {
                    return {
                        ...c,
                        lines: c.lines.map(l => (l.id === id ? { ...l, quantity: q } : l)),
                    };
                }
                return c;
            });
            storefrontApiMutation({
                adjustOrderLine: [
                    { orderLineId: id, quantity: q },
                    {
                        '...on Order': ActiveOrderSelector,
                        '...on OrderLimitError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on InsufficientStockError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on NegativeQuantityError': {
                            errorCode: true,
                            message: true,
                        },
                        '...on OrderModificationError': {
                            errorCode: true,
                            message: true,
                        },
                        __typename: true,
                    },
                ],
            }).then(r => {
                if (r.adjustOrderLine.__typename === 'Order') {
                    setActiveOrder(r.adjustOrderLine);
                }
            });
        };

        const changeShippingMethod = async (id: string) => {
            const { setOrderShippingMethod } = await storefrontApiMutation({
                setOrderShippingMethod: [
                    { shippingMethodId: [id] },
                    {
                        __typename: true,
                        '...on Order': ActiveOrderSelector,
                        '...on IneligibleShippingMethodError': { errorCode: true, message: true },
                        '...on NoActiveOrderError': { errorCode: true, message: true },
                        '...on OrderModificationError': { errorCode: true, message: true },
                    },
                ],
            });
            if (setOrderShippingMethod.__typename === 'Order') {
                setActiveOrder(setOrderShippingMethod);
                return;
            }
        };

        const applyCouponCode = async (code: string) => {
            const { applyCouponCode } = await storefrontApiMutation({
                applyCouponCode: [
                    { couponCode: code },
                    {
                        __typename: true,
                        '...on Order': ActiveOrderSelector,
                        '...on CouponCodeExpiredError': { errorCode: true, message: true },
                        '...on CouponCodeInvalidError': { errorCode: true, message: true },
                        '...on CouponCodeLimitError': { errorCode: true, message: true },
                    },
                ],
            });
            if (applyCouponCode.__typename === 'Order') {
                setActiveOrder(applyCouponCode);
                return true;
            }
            return false;
        };

        const removeCouponCode = async (code: string) => {
            const { removeCouponCode } = await storefrontApiMutation({
                removeCouponCode: [{ couponCode: code }, ActiveOrderSelector],
            });
            if (removeCouponCode?.id) {
                setActiveOrder(removeCouponCode);
                return;
            }
        };
        return {
            activeOrder,
            changeShippingMethod,
            applyCouponCode,
            removeCouponCode,

            addToCheckout,
            removeFromCheckout,
            changeQuantity,
        };
    },
);

export const useCheckout = useCheckoutContainer.useContainer;
export const CheckoutProvider = useCheckoutContainer.Provider;
