import { storefrontApiMutation } from '@/src/graphql/client';
import { ActiveOrderSelector, ActiveOrderType } from '@/src/graphql/selectors';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { CheckoutContainerType } from './types';
import { emptyCheckoutState } from './utils';
import { useChannels } from '../channels';

//This is the Checkout Store
//It is used to manage the active order on checkout pages
//It looks same as the Cart Store, but it accept an initial state and it has some extra methods
//Prepared for future use *in feature checkout can be different than cart
//Additional useCart is on client side, because it is used in many places
const useCheckoutContainer = createContainer<CheckoutContainerType, { checkout: ActiveOrderType }>(initialState => {
    if (!initialState?.checkout) return emptyCheckoutState;
    const ctx = useChannels();
    const [activeOrder, setActiveOrder] = useState<ActiveOrderType>(initialState.checkout);

    const addToCheckout = async (id: string, q: number) => {
        try {
            const { addItemToOrder } = await storefrontApiMutation(ctx)({
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
            });
            if (addItemToOrder.__typename === 'Order') {
                setActiveOrder(addItemToOrder);
                return;
            }
        } catch {
            console.log('Error while adding item to checkout');
        }
    };

    const removeFromCheckout = async (id: string) => {
        try {
            const { removeOrderLine } = await storefrontApiMutation(ctx)({
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
            });
            if (removeOrderLine.__typename === 'Order') {
                setActiveOrder(removeOrderLine);
                return;
            }
        } catch {
            console.log('Error while removing item from checkout');
        }
    };

    const changeQuantity = async (id: string, q: number) => {
        try {
            const { adjustOrderLine } = await storefrontApiMutation(ctx)({
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
            });
            if (adjustOrderLine.__typename === 'Order') {
                setActiveOrder(adjustOrderLine);
                return;
            }
        } catch {
            console.log('Error while changing quantity');
        }
    };

    const changeShippingMethod = async (id: string) => {
        try {
            const { setOrderShippingMethod } = await storefrontApiMutation(ctx)({
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
        } catch {
            console.log('Error while changing shipping method');
        }
    };

    const applyCouponCode = async (code: string) => {
        try {
            const { applyCouponCode } = await storefrontApiMutation(ctx)({
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
        } catch {
            console.log('Error while applying coupon code');
            return false;
        }
    };

    const removeCouponCode = async (code: string) => {
        try {
            const { removeCouponCode } = await storefrontApiMutation(ctx)({
                removeCouponCode: [{ couponCode: code }, ActiveOrderSelector],
            });
            if (removeCouponCode?.id) {
                setActiveOrder(removeCouponCode);
                return;
            }
        } catch {
            console.log('Error while removing coupon code');
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
});

export const useCheckout = useCheckoutContainer.useContainer;
export const CheckoutProvider = useCheckoutContainer.Provider;
