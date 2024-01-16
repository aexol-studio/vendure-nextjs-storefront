import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';
import { IconButton } from '@/src/components/molecules/Button';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { ShoppingCartIcon } from 'lucide-react';
import { useCart } from '@/src/state/cart';
import { CurrencyCode } from '@/src/zeus';
import { CartHeader } from './CartHeader';
import { CartFooter } from './CartFooter';
import { CartBody } from './CartBody';
import { useOutsideClick } from '@/src/util/hooks/useOutsideClick';

export const CartDrawer = ({ activeOrder }: { activeOrder?: ActiveOrderType }) => {
    const { isOpen, open, close } = useCart();
    const currencyCode = activeOrder?.currencyCode || CurrencyCode.USD;
    const discountsSum = useMemo(() => {
        const discounts = activeOrder?.discounts?.reduce((acc, discount) => acc - discount.amountWithTax, 0) ?? 0;
        return discounts;
    }, [activeOrder]);

    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, () => close());

    return (
        <>
            <IconButton onClick={open}>
                <ShoppingCartIcon size={'2.4rem'} />
                <QuantityBadge id="header-cart-quantity">
                    <Quantity size="1rem" weight={500}>
                        {activeOrder ? activeOrder.lines.length : 0}
                    </Quantity>
                </QuantityBadge>
            </IconButton>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <CartComponentMain
                        ref={ref}
                        initial={{ transform: 'translateX(100%)' }}
                        animate={{ transform: 'translateX(0%)' }}
                        exit={{ transform: 'translateX(100%)' }}>
                        <CartContainer column>
                            <CartHeader activeOrder={activeOrder} />
                            <CartBody activeOrder={activeOrder} currencyCode={currencyCode} />
                            <CartFooter
                                activeOrder={activeOrder}
                                currencyCode={currencyCode}
                                discountsSum={discountsSum}
                            />
                        </CartContainer>
                    </CartComponentMain>
                )}
            </AnimatePresence>
        </>
    );
};

const QuantityBadge = styled.div`
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;

    padding: 0.25rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 100%;
    background: ${p => p.theme.gray(100)};
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Quantity = styled(TP)`
    color: ${p => p.theme.text.main};
`;

const CartComponentMain = styled(motion.div)`
    width: 100%;
    max-width: 55rem;
    height: 100dvh;

    z-index: 2147483647;

    position: fixed;
    top: 0;
    right: 0;

    overflow-y: auto;

    background: ${p => p.theme.gray(0)};
    border-left: 1px solid ${p => p.theme.gray(100)};
    box-shadow: 0rem 0.2rem 1rem ${p => p.theme.shadow};
`;

const CartContainer = styled(Stack)`
    height: 100%;
`;
