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
        console.log({ response });
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
    console.log({ activeOrder });
    return {
        activeOrder,
        cart: activeOrder,
        addToCart,
        setItemQuantityInCart,
        setTemporaryCustomerForOrder,
        removeFromCart,
        fetchActiveOrder,
    };
});

export const useCart = useCartContainer.useContainer;
export const CartProvider = useCartContainer.Provider;
