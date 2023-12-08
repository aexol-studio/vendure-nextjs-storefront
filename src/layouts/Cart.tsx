import { useLayer, Arrow } from 'react-laag';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import styled from '@emotion/styled';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';
import { Button, IconButton } from '@/src/components/molecules/Button';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { ShoppingCartIcon } from 'lucide-react';
export const Cart = ({ activeOrder }: { activeOrder?: ActiveOrderType }) => {
    const [isOpen, setOpen] = useState(false);

    // helper function to close the menu
    const close = () => {
        // setOpen(false);
    };

    const { renderLayer, triggerProps, layerProps, arrowProps } = useLayer({
        isOpen,
        onOutsideClick: close, // close the menu when the user clicks outside
        onDisappear: close, // close the menu when the menu gets scrolled out of sight
        overflowContainer: false, // keep the menu positioned inside the container
        auto: true, // automatically find the best placement
        placement: 'bottom-center', // we prefer to place the menu "top-end"
        triggerOffset: 12, // keep some distance to the trigger
        containerOffset: 16, // give the menu some room to breath relative to the container
        arrowOffset: 16, // let the arrow have some room to breath also
    });

    // Again, we're using framer-motion for the transition effect
    return (
        <>
            <IconButton {...triggerProps} onClick={() => setOpen(!isOpen)}>
                <ShoppingCartIcon />
            </IconButton>
            {renderLayer(
                <AnimatePresence>
                    {isOpen && (
                        <CartComponentMain
                            {...layerProps}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}>
                            <Stack column gap="2rem">
                                <TH2>Cart</TH2>
                                {activeOrder?.lines.map(l => (
                                    <Stack gap="1rem" key={l.id}>
                                        <TP>{l.productVariant.name}</TP>
                                        <TP>{l.quantity}</TP>
                                        <TP>{l.linePriceWithTax}</TP>
                                    </Stack>
                                ))}
                                <Button>Checkout</Button>
                                <Arrow {...arrowProps} />
                            </Stack>
                        </CartComponentMain>
                    )}
                </AnimatePresence>,
            )}
        </>
    );
};

const CartComponentMain = styled(motion.ul)`
    padding: 2rem;
    border-radius: ${p => p.theme.borderRadius};
    z-index: 1;
    opacity: 0;
    border: 1px solid ${p => p.theme.accent(50)};
    background: ${p => p.theme.gray(0)};
`;
