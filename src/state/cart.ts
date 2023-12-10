import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import { ActiveOrderSelector, ActiveOrderType } from '@/src/graphql/selectors';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

const TEMP_CUSTOMER = 'vendure-customer';

const useCartContainer = createContainer(() => {
    const [activeOrder, setActiveOrder] = useState<ActiveOrderType>();

    const fetchActiveOrder = async () => {
        const response = await storefrontApiQuery({
            activeOrder: ActiveOrderSelector,
        });
        setActiveOrder(response.activeOrder);
        return response.activeOrder;
    };

    const setTemporaryCustomerForOrder = async () => {
        const tempCustomerId = window.localStorage.getItem(TEMP_CUSTOMER) || Math.random().toFixed(8);
        window.localStorage.setItem(TEMP_CUSTOMER, tempCustomerId);
        storefrontApiMutation({
            setCustomerForOrder: [
                {
                    input: {
                        firstName: 'Artur',
                        lastName: 'Czemiel',
                        emailAddress: 'artur@aexol.com',
                    },
                },
                {
                    __typename: true,
                    '...on Order': ActiveOrderSelector,
                    '...on AlreadyLoggedInError': {
                        errorCode: true,
                        message: true,
                    },
                    '...on EmailAddressConflictError': {
                        errorCode: true,
                        message: true,
                    },
                    '...on GuestCheckoutError': {
                        errorCode: true,
                        message: true,
                    },
                    '...on NoActiveOrderError': {
                        errorCode: true,
                        message: true,
                    },
                },
            ],
        }).then(r => {
            if (r.setCustomerForOrder.__typename === 'Order') {
                setActiveOrder(r.setCustomerForOrder);
            }
        });
    };

    const addToCart = (id: string, q: number) => {
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
    const removeFromCart = (id: string) => {
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
    const setItemQuantityInCart = (id: string, q: number) => {
        setActiveOrder(c => {
            if (c?.lines.find(l => l.id === id)) {
                return { ...c, lines: c.lines.map(l => (l.id === id ? { ...l, q } : l)) };
            }
            return c;
        });
        return storefrontApiMutation({
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
                return;
            }
            return r.adjustOrderLine;
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
        cart: activeOrder,
        addToCart,
        setItemQuantityInCart,
        setTemporaryCustomerForOrder,
        removeFromCart,
        fetchActiveOrder,
        changeShippingMethod,

        applyCouponCode,
        removeCouponCode,
    };
});

export const useCart = useCartContainer.useContainer;
export const CartProvider = useCartContainer.Provider;
