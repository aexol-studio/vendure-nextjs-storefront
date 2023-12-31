import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import { ActiveOrderSelector, ActiveOrderType } from '@/src/graphql/selectors';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

const useCartContainer = createContainer(() => {
    const [activeOrder, setActiveOrder] = useState<ActiveOrderType>();
    const [isLogged, setIsLogged] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const open = () => setOpen(true);
    const close = () => setOpen(false);

    const fetchActiveOrder = async () => {
        try {
            const [{ activeOrder }, { activeCustomer }] = await Promise.all([
                storefrontApiQuery({ activeOrder: ActiveOrderSelector }),
                storefrontApiQuery({ activeCustomer: { id: true } }),
            ]);
            setActiveOrder(activeOrder);
            setIsLogged(!!activeCustomer?.id);
            return activeOrder;
        } catch (e) {
            console.log(e);
        }
    };

    const addToCart = async (id: string, q: number, o?: boolean) => {
        //TODO: work here
        // const founded = activeOrder?.lines.find(l => l.productVariant.id === id);
        setActiveOrder(c => {
            return c && { ...c, totalQuantity: c.totalQuantity + 1 };
        });
        try {
            const { addItemToOrder } = await storefrontApiMutation({
                addItemToOrder: [
                    { productVariantId: id, quantity: q },
                    {
                        __typename: true,
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
                    },
                ],
            });
            if (addItemToOrder.__typename === 'Order') {
                setActiveOrder(addItemToOrder);
                if (o) open();
            }
        } catch (e) {
            console.log(e);
        }
    };
    const removeFromCart = async (id: string) => {
        setActiveOrder(c => {
            return c && { ...c, lines: c.lines.filter(l => l.id !== id) };
        });
        try {
            const { removeOrderLine } = await storefrontApiMutation({
                removeOrderLine: [
                    { orderLineId: id },
                    {
                        __typename: true,
                        '...on Order': ActiveOrderSelector,
                        '...on OrderModificationError': {
                            errorCode: true,
                            message: true,
                        },
                    },
                ],
            });
            if (removeOrderLine.__typename === 'Order') {
                setActiveOrder(removeOrderLine);
                return;
            }
        } catch (e) {
            console.log(e);
        }
    };
    const setItemQuantityInCart = async (id: string, q: number) => {
        try {
            setActiveOrder(c => {
                if (c?.lines.find(l => l.id === id)) {
                    return { ...c, lines: c.lines.map(l => (l.id === id ? { ...l, q } : l)) };
                }
                return c;
            });
            const { adjustOrderLine } = await storefrontApiMutation({
                adjustOrderLine: [
                    { orderLineId: id, quantity: q },
                    {
                        __typename: true,
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
                    },
                ],
            });
            if (adjustOrderLine.__typename === 'Order') {
                setActiveOrder(adjustOrderLine);
                return;
            }
            return adjustOrderLine;
        } catch (e) {
            console.log(e);
        }
    };

    const applyCouponCode = async (code: string) => {
        try {
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
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    const removeCouponCode = async (code: string) => {
        try {
            const { removeCouponCode } = await storefrontApiMutation({
                removeCouponCode: [{ couponCode: code }, ActiveOrderSelector],
            });
            if (removeCouponCode?.id) {
                setActiveOrder(removeCouponCode);
                return;
            }
        } catch (e) {
            console.log(e);
        }
    };

    return {
        isLogged,
        activeOrder,
        cart: activeOrder,
        addToCart,
        setItemQuantityInCart,
        removeFromCart,
        fetchActiveOrder,

        applyCouponCode,
        removeCouponCode,

        isOpen,
        open,
        close,
    };
});

export const useCart = useCartContainer.useContainer;
export const CartProvider = useCartContainer.Provider;
