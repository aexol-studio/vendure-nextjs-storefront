import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
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

export const CartDrawer = ({ activeOrder }: { activeOrder?: ActiveOrderType }) => {
    const { isOpen, open, close } = useCart();

    const currencyCode = activeOrder?.currencyCode || CurrencyCode.USD;
    const discountsSum = useMemo(() => {
        const discounts = activeOrder?.discounts?.reduce((acc, discount) => acc - discount.amountWithTax, 0) ?? 0;
        return discounts;
    }, [activeOrder]);

    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                close();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <IconButton onClick={open}>
                <ShoppingCartIcon size={'2.4rem'} />
                <TP>{activeOrder?.lines.length}</TP>
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

const CartComponentMain = styled(motion.div)`
    width: 100%;
    max-width: 55rem;
    height: 100vh;

    z-index: 1;

    position: fixed;
    top: 0;
    right: 0;

    overflow-y: auto;

    background: ${p => p.theme.gray(0)};
    box-shadow: 0rem 0.2rem 0.5rem ${({ theme }) => theme.shadow};
`;

const CartContainer = styled(Stack)`
    height: 100%;
`;
