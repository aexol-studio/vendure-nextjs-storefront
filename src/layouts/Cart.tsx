import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';
import { IconButton } from '@/src/components/molecules/Button';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { ShoppingCartIcon, X, Trash2 } from 'lucide-react';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { QuantityCounter } from '@/src/components/molecules/QuantityCounter';
import { Divider } from '@/src/components/atoms/Divider';
import { useCart } from '@/src/state/cart';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFormatter';
import { DiscountForm } from '@/src/components/molecules/DiscountForm';
import { CurrencyCode } from '@/src/zeus';

export const Cart = ({ activeOrder }: { activeOrder?: ActiveOrderType }) => {
    const { setItemQuantityInCart, removeFromCart, removeCouponCode, applyCouponCode } = useCart();
    const { t } = useTranslation('common');
    const [isOpen, setOpen] = useState(false);

    // helper function to close the menu
    const close = () => {
        setOpen(false);
    };
    // Again, we're using framer-motion for the transition effect

    const currencyCode = activeOrder?.currencyCode || CurrencyCode.USD;
    const discountsSum = useMemo(() => {
        const discounts = activeOrder?.discounts?.reduce((acc, discount) => acc - discount.amountWithTax, 0) ?? 0;
        return discounts;
    }, [activeOrder]);

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
                                    <Stack itemsCenter gap="1.25rem">
                                        <TH2>{t('your-cart')}</TH2>
                                        {activeOrder?.totalQuantity ? (
                                            <TP style={{ marginTop: '0.8rem' }}>
                                                ({activeOrder?.totalQuantity} {t('items')})
                                            </TP>
                                        ) : null}
                                    </Stack>
                                    <IconButton onClick={close}>
                                        <X />
                                    </IconButton>
                                </Stack>

                                <Stack gap="12rem">
                                    <CartList column>
                                        {activeOrder?.lines.map(
                                            ({
                                                productVariant,
                                                id,
                                                featuredAsset,
                                                quantity,
                                                linePriceWithTax,
                                                discountedLinePriceWithTax,
                                            }) => {
                                                const optionInName =
                                                    productVariant.name.replace(productVariant.product.name, '') !== '';
                                                const isPriceDiscounted =
                                                    linePriceWithTax !== discountedLinePriceWithTax;

                                                return (
                                                    <CartRow gap="12rem" key={id}>
                                                        <CartImage src={featuredAsset?.preview} />
                                                        <Stack column gap="2.5rem">
                                                            <Stack column>
                                                                <TP
                                                                    size="1.75rem"
                                                                    weight={500}
                                                                    style={{ whiteSpace: 'nowrap' }}>
                                                                    {productVariant.product.name}
                                                                </TP>
                                                                {optionInName && (
                                                                    <TP size="1.5rem" weight={400}>
                                                                        {productVariant.name.replace(
                                                                            productVariant.product.name,
                                                                            '',
                                                                        )}
                                                                    </TP>
                                                                )}
                                                            </Stack>
                                                            <QuantityCounter
                                                                v={quantity}
                                                                onChange={v => setItemQuantityInCart(id, v)}
                                                            />
                                                            <Remove onClick={async () => await removeFromCart(id)}>
                                                                <Trash2 size={20} />
                                                                <TP weight={600} size="1.25rem" upperCase>
                                                                    {t('remove')}
                                                                </TP>
                                                            </Remove>
                                                        </Stack>
                                                        {isPriceDiscounted ? (
                                                            <Stack justifyEnd gap="0.5rem">
                                                                <TP
                                                                    size="1.25rem"
                                                                    style={{
                                                                        textDecoration: 'line-through',
                                                                        lineHeight: '2.4rem',
                                                                    }}>
                                                                    {priceFormatter(linePriceWithTax, currencyCode)}
                                                                </TP>
                                                                <TP style={{ color: 'red' }}>
                                                                    {priceFormatter(
                                                                        discountedLinePriceWithTax,
                                                                        currencyCode,
                                                                    )}
                                                                </TP>
                                                            </Stack>
                                                        ) : (
                                                            <TP>{priceFormatter(linePriceWithTax, currencyCode)}</TP>
                                                        )}
                                                    </CartRow>
                                                );
                                            },
                                        )}
                                    </CartList>
                                    <CartSummary column gap="3rem">
                                        <TP size="2.5rem" weight={600}>
                                            {t('cart-summary')}
                                        </TP>
                                        {activeOrder && activeOrder.totalQuantity > 0 ? (
                                            <Stack column gap="2.5rem">
                                                {activeOrder?.totalWithTax ? (
                                                    <Stack justifyBetween>
                                                        <TP>{t('price')}</TP>
                                                        <TP>
                                                            {priceFormatter(activeOrder?.totalWithTax, currencyCode)}
                                                        </TP>
                                                    </Stack>
                                                ) : null}
                                                {discountsSum !== 0 ? (
                                                    <Stack justifyBetween>
                                                        <TP>{t('discount')}</TP>
                                                        <TP>-{priceFormatter(discountsSum, currencyCode)}</TP>
                                                    </Stack>
                                                ) : null}
                                                {activeOrder?.shippingWithTax ? (
                                                    <Stack justifyBetween>
                                                        <TP>{t('shipping')}</TP>
                                                        <TP>
                                                            {priceFormatter(activeOrder?.shippingWithTax, currencyCode)}
                                                        </TP>
                                                    </Stack>
                                                ) : null}
                                                {activeOrder?.discounts?.map(d => (
                                                    <Stack key={d.description} justifyBetween>
                                                        <Stack itemsCenter gap="1.25rem">
                                                            <Remove onClick={() => removeCouponCode(d.description)}>
                                                                <X size={16} />
                                                            </Remove>
                                                            <TP>
                                                                {t('coupon-code')} {d.description}
                                                            </TP>
                                                        </Stack>
                                                        <TP>{priceFormatter(d.amountWithTax, currencyCode)}</TP>
                                                    </Stack>
                                                ))}
                                                <Divider style={{ margin: '3.2rem 0' }} />
                                                <Stack column gap="2.5rem">
                                                    {activeOrder?.totalWithTax ? (
                                                        <Stack justifyBetween>
                                                            <TP>{t('subtotal')}</TP>
                                                            <TP>
                                                                {priceFormatter(
                                                                    activeOrder.subTotalWithTax,
                                                                    currencyCode,
                                                                )}
                                                            </TP>
                                                        </Stack>
                                                    ) : null}
                                                    <DiscountForm applyCouponCode={applyCouponCode} />
                                                    <Divider />
                                                    {activeOrder?.totalWithTax ? (
                                                        <Stack justifyBetween>
                                                            <TP>{t('total')}</TP>
                                                            <TP>
                                                                {priceFormatter(activeOrder.totalWithTax, currencyCode)}
                                                            </TP>
                                                        </Stack>
                                                    ) : null}
                                                    <Stack column gap="3rem">
                                                        <StyledLink href="/checkout">
                                                            {t('proceed-to-checkout')}
                                                        </StyledLink>
                                                        <StyledButton onClick={close}>
                                                            {t('continue-shopping')}
                                                        </StyledButton>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        ) : (
                                            <Stack column itemsCenter gap="3rem">
                                                <TP weight={600}>{t('empty-cart')}</TP>
                                                <StyledButton dark onClick={close}>
                                                    {t('continue-shopping')}
                                                </StyledButton>
                                            </Stack>
                                        )}
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

const Remove = styled.button`
    appearance: none;
    border: none;
    background: transparent;

    display: flex;
    align-items: center;
    width: fit-content;

    gap: 0.4rem;
`;

const StyledButton = styled.button<{ dark?: boolean }>`
    appearance: none;
    border: none;
    background: ${p => (p.dark ? p.theme.gray(1000) : p.theme.gray(0))};

    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 1.6rem 0.8rem;

    color: ${p => (p.dark ? p.theme.gray(0) : p.theme.gray(1000))};
    text-align: center;
    text-transform: uppercase;
    font-weight: 500;
    font-size: 1.6rem;
`;
const StyledLink = styled(Link)`
    padding: 1.6rem 0.8rem;
    background: ${p => p.theme.gray(1000)};

    color: ${p => p.theme.gray(0)};
    text-align: center;
    text-transform: uppercase;
    font-weight: 500;
    font-size: 1.6rem;
`;
const CartContainer = styled(Stack)`
    padding: 4rem 0;
`;
const CartSummary = styled(Stack)`
    min-width: 390px;
    max-width: 480px;

    padding: 3rem;
    border: 1px solid ${p => p.theme.gray(100)};
`;
const CartList = styled(Stack)`
    flex: 1;
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
