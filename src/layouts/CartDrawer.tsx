import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { Stack } from '@/src/components/atoms/Stack';
import { IconButton } from '@/src/components/molecules/Button';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { ShoppingCartIcon, X, Trash2 } from 'lucide-react';
import { QuantityCounter } from '@/src/components/molecules/QuantityCounter';
import { useCart } from '@/src/state/cart';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFomatter';
import { DiscountForm } from '@/src/components/molecules/DiscountForm';
import { CurrencyCode } from '../zeus';

export const CartDrawer = ({ activeOrder }: { activeOrder?: ActiveOrderType }) => {
    const { setItemQuantityInCart, removeFromCart, removeCouponCode, applyCouponCode } = useCart();
    const { t } = useTranslation('common');
    const [isOpen, setOpen] = useState(false);
    const open = () => setOpen(true);
    const close = () => setOpen(false);

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
                <TP>{activeOrder?.totalQuantity}</TP>
            </IconButton>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <CartComponentMain
                        ref={ref}
                        initial={{ transform: 'translateX(100%)' }}
                        animate={{ transform: 'translateX(0%)' }}
                        exit={{ transform: 'translateX(100%)' }}>
                        <CartContainer column>
                            <CartHeaderWrapper justifyBetween itemsCenter>
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
                            </CartHeaderWrapper>
                            <CartList w100 column>
                                {activeOrder && activeOrder.totalQuantity > 0 ? (
                                    activeOrder.lines.map(
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
                                            const isPriceDiscounted = linePriceWithTax !== discountedLinePriceWithTax;

                                            return (
                                                <CartRow w100 justifyBetween key={id}>
                                                    <Stack gap="3.5rem">
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
                                                            <Remove onClick={() => removeFromCart(id)}>
                                                                <Trash2 size={20} />
                                                                <TP weight={600} size="1.25rem" upperCase>
                                                                    {t('remove')}
                                                                </TP>
                                                            </Remove>
                                                        </Stack>
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
                                    )
                                ) : (
                                    <Stack itemsCenter justifyCenter style={{ height: '100%' }}>
                                        <TP>{t('cart-empty')}</TP>
                                    </Stack>
                                )}
                            </CartList>
                            <CartFooterWrapper
                                column
                                justifyBetween
                                gap="2.5rem"
                                haveItems={!!activeOrder?.totalQuantity}>
                                {activeOrder && activeOrder?.totalQuantity > 0 ? (
                                    <>
                                        <Stack w100 justifyBetween>
                                            <Stack column w100 gap="1.5rem" style={{ padding: '1rem' }}>
                                                <Stack column>
                                                    <Stack justifyBetween>
                                                        <TP>{t('subtotal')}</TP>
                                                        <TP>
                                                            {priceFormatter(
                                                                (activeOrder?.subTotalWithTax || 0) + discountsSum,
                                                                currencyCode,
                                                            )}
                                                        </TP>
                                                    </Stack>
                                                    {discountsSum > 0 ? (
                                                        <Stack justifyBetween>
                                                            <TP>{t('discount')}</TP>
                                                            <TP>-{priceFormatter(discountsSum, currencyCode)}</TP>
                                                        </Stack>
                                                    ) : null}
                                                    <Stack justifyBetween>
                                                        <TP weight={600}>{t('total')}</TP>
                                                        <TP weight={600}>
                                                            {priceFormatter(
                                                                activeOrder?.subTotalWithTax || 0,
                                                                currencyCode,
                                                            )}
                                                        </TP>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                            <Stack column w100 gap="1rem" style={{ padding: '1rem' }}>
                                                <DiscountForm applyCouponCode={applyCouponCode} />
                                                <Stack column gap="0.25rem">
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
                                                </Stack>
                                            </Stack>
                                        </Stack>
                                        <StyledLink href="/checkout">{t('proceed-to-checkout')}</StyledLink>
                                    </>
                                ) : (
                                    <StyledButton onClick={close}>{t('continue-shopping')}</StyledButton>
                                )}
                            </CartFooterWrapper>
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
    box-shadow: -2rem 1.5rem 2.5rem 1rem rgba(0, 0, 0, 0.2);
`;

const CartContainer = styled(Stack)`
    height: 100%;
`;

const CartHeaderWrapper = styled(Stack)`
    padding: 1.5rem 2rem;
    box-shadow: 0 0.5rem 1rem 0 rgba(0, 0, 0, 0.1);
`;

const CartList = styled(Stack)`
    flex: 1;
    padding: 1.5rem 2rem;
    overflow-y: auto;
    ::-webkit-scrollbar {
        height: 0.8rem;
        width: 0.8rem;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: ${p => p.theme.gray(200)};
        border-radius: 1rem;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: ${p => p.theme.gray(400)};
    }
`;
const CartRow = styled(Stack)`
    padding: 2rem 0;
    border-bottom: 1px solid ${p => p.theme.gray(50)};
`;

const CartImage = styled.img`
    object-fit: cover;
    width: 12.6rem;
    height: 17.5rem;
    border: 1px solid ${p => p.theme.gray(200)};
`;

const CartFooterWrapper = styled(Stack)<{ haveItems?: boolean }>`
    padding: 1.5rem 2rem;
    box-shadow: 0 -0.5rem 1rem 0 rgba(0, 0, 0, 0.1);
    height: ${p => (p.haveItems ? '30%' : 'fit-content')};
`;

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
    border: 1px solid ${p => p.theme.gray(1000)};
    border-radius: ${p => p.theme.borderRadius};
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
