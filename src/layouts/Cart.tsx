import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import styled from '@emotion/styled';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';
import { Button, IconButton } from '@/src/components/molecules/Button';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { ShoppingCartIcon, X } from 'lucide-react';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { QuantityCounter } from '@/src/components/molecules/QuantityCounter';
import { Divider } from '@/src/components/atoms/Divider';
import { useCart } from '@/src/state/cart';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '../util/priceFomatter';

export const Cart = ({ activeOrder }: { activeOrder?: ActiveOrderType }) => {
    const { setItemQuantityInCart } = useCart();
    const { t } = useTranslation('common');
    const [isOpen, setOpen] = useState(false);

    // helper function to close the menu
    const close = () => {
        setOpen(false);
    };
    // Again, we're using framer-motion for the transition effect
    return (
        <>
            <IconButton onClick={() => setOpen(!isOpen)}>
                <ShoppingCartIcon />
                <span>{activeOrder?.totalQuantity}</span>
            </IconButton>
            <AnimatePresence>
                {isOpen && (
                    <CartComponentMain initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ContentContainer>
                            <CartContainer column gap="2rem">
                                <Stack justifyBetween>
                                    <Stack itemsCenter gap="2.5rem">
                                        <TH2>{t('your-cart')}</TH2>
                                        {activeOrder?.totalQuantity ? (
                                            <TP>
                                                ({activeOrder?.totalQuantity} {t('items')})
                                            </TP>
                                        ) : null}
                                    </Stack>
                                    <IconButton onClick={close}>
                                        <X />
                                    </IconButton>
                                </Stack>
                                <Stack gap="12rem">
                                    <Stack column>
                                        {activeOrder?.lines.map(l => (
                                            <CartRow gap="12rem" key={l.id}>
                                                <CartImage src={l.featuredAsset?.preview} />
                                                <Stack column gap="2.5rem">
                                                    <TP weight={500} size="1.75rem">
                                                        {l.productVariant.name}
                                                    </TP>
                                                    <QuantityCounter
                                                        v={l.quantity}
                                                        onChange={v => setItemQuantityInCart(l.id, v)}
                                                    />
                                                </Stack>
                                                <TP>{priceFormatter(l.linePriceWithTax, activeOrder.currencyCode)}</TP>
                                            </CartRow>
                                        ))}
                                    </Stack>
                                    <CartSummary column gap="3rem">
                                        <TP size="2.5rem" weight={600}>
                                            {t('cart-summary')}
                                        </TP>
                                        <Stack column>
                                            <Stack justifyBetween>
                                                <TP>{t('price')}</TP>
                                                {activeOrder?.subTotalWithTax ? (
                                                    <TP size="2rem">
                                                        {priceFormatter(
                                                            activeOrder?.subTotalWithTax,
                                                            activeOrder.currencyCode,
                                                        )}
                                                    </TP>
                                                ) : null}
                                            </Stack>
                                            <Stack justifyBetween>
                                                <TP>{t('discount')}</TP>
                                                {activeOrder?.totalWithTax ? (
                                                    <TP>
                                                        {priceFormatter(
                                                            activeOrder?.totalWithTax,
                                                            activeOrder.currencyCode,
                                                        )}
                                                    </TP>
                                                ) : null}
                                            </Stack>
                                            {activeOrder?.discounts.map(d => (
                                                <Stack key={d.description} justifyBetween>
                                                    <TP>{d.description}</TP>
                                                    <TP>{priceFormatter(d.amountWithTax, activeOrder.currencyCode)}</TP>
                                                </Stack>
                                            ))}
                                            <Stack justifyBetween>
                                                <TP>{t('shipping')}</TP>
                                                {activeOrder?.shippingWithTax ? (
                                                    <TP>
                                                        {priceFormatter(
                                                            activeOrder?.shippingWithTax,
                                                            activeOrder.currencyCode,
                                                        )}
                                                    </TP>
                                                ) : null}
                                            </Stack>
                                            <Divider />
                                        </Stack>
                                        {activeOrder?.totalWithTax ? (
                                            <TP>
                                                {priceFormatter(activeOrder?.totalWithTax, activeOrder.currencyCode)}
                                            </TP>
                                        ) : null}
                                        {activeOrder?.totalQuantity ? (
                                            <Link href="/checkout">{t('proceed-to-checkout')}</Link>
                                        ) : null}
                                        <Button onClick={close}>{t('continue-shopping')}</Button>
                                    </CartSummary>
                                </Stack>
                            </CartContainer>
                        </ContentContainer>
                    </CartComponentMain>
                )}
            </AnimatePresence>
        </>
    );
};
const CartContainer = styled(Stack)`
    padding: 4rem 0;
`;
const CartSummary = styled(Stack)`
    padding: 3rem;
    border: 1px solid ${p => p.theme.gray(100)};
`;
const CartRow = styled(Stack)`
    padding: 3rem 0;
    border-bottom: 1px solid ${p => p.theme.gray(50)};
`;
const CartImage = styled.img`
    object-fit: cover;
    width: 12.6rem;
    height: 17.5rem;
    border: 1px solid ${p => p.theme.gray(200)};
`;

const CartComponentMain = styled(motion.div)`
    position: absolute;
    z-index: 1;
    opacity: 0;
    inset: 0;
    top: 8.6rem;
    height: calc(100vh - 8.6rem + 12px);
    overflow-y: auto;
    width: 100%;
    border: 1px solid ${p => p.theme.accent(50)};
    background: ${p => p.theme.gray(0)};
`;
