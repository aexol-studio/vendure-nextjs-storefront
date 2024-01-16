import { Price } from '@/src/components/atoms/Price';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { ProductImageWithInfo } from '@/src/components/molecules/ProductImageWithInfo';
import { QuantityCounter } from '@/src/components/molecules/QuantityCounter';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { useCart } from '@/src/state/cart';
import { CurrencyCode } from '@/src/zeus';
import styled from '@emotion/styled';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

interface Props {
    activeOrder?: ActiveOrderType;
    currencyCode: CurrencyCode;
}

export const CartBody: React.FC<Props> = ({ currencyCode, activeOrder }) => {
    const { t } = useTranslation('common');
    const { setItemQuantityInCart, removeFromCart } = useCart();
    return (
        <CartList w100 column>
            {activeOrder && activeOrder.totalQuantity > 0 ? (
                activeOrder.lines.map(
                    ({ productVariant, id, featuredAsset, quantity, unitPriceWithTax, discountedLinePriceWithTax }) => {
                        const optionInName = productVariant.name.replace(productVariant.product.name, '') !== '';
                        return (
                            <CartRow w100 justifyBetween key={id}>
                                <Stack gap="2rem">
                                    <ProductImageWithInfo
                                        size="thumbnail-big"
                                        href={`/products/${productVariant.product.slug}`}
                                        imageSrc={featuredAsset?.preview}
                                    />
                                    <Stack column gap="2rem">
                                        <Stack column>
                                            <TP size="1.75rem" weight={500} noWrap>
                                                {productVariant.product.name}
                                            </TP>
                                            {optionInName && (
                                                <TP size="1.5rem" weight={400}>
                                                    {productVariant.name.replace(productVariant.product.name, '')}
                                                </TP>
                                            )}
                                        </Stack>
                                        <QuantityCounter v={quantity} onChange={v => setItemQuantityInCart(id, v)} />
                                        <Remove onClick={async () => await removeFromCart(id)}>
                                            <Trash2 size={'2rem'} />
                                            <TP weight={600} size="1rem" upperCase>
                                                {t('remove')}
                                            </TP>
                                        </Remove>
                                    </Stack>
                                </Stack>
                                <Price
                                    currencyCode={currencyCode}
                                    price={unitPriceWithTax}
                                    discountPrice={discountedLinePriceWithTax / quantity}
                                    quantity={quantity}
                                />
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
    );
};

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

const Remove = styled.button`
    appearance: none;
    border: none;
    background: transparent;

    display: flex;
    align-items: center;
    width: fit-content;

    gap: 0.4rem;
`;
