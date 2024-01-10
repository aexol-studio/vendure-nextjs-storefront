import React from 'react';
import { useTranslation } from 'next-i18next';
import { useCart } from '@/src/state/cart';
import { Stack, ProductImage, TP, Price, Link } from '@/src/components/atoms';
import { Button } from '@/src/components/molecules/Button';
import { CollectionTileProductVariantType } from '@/src/graphql/selectors';

export const ProductCard: React.FC<{ variant: CollectionTileProductVariantType }> = ({ variant }) => {
    const { t } = useTranslation('common');
    const { addToCart } = useCart();
    const optionInName = variant.name.replace(variant.product.name, '') !== '';
    const asset = variant.featuredAsset?.preview
        ? variant.featuredAsset.preview
        : variant.product.featuredAsset?.preview;
    if (!asset) return null;
    return (
        <Stack column gap="1rem">
            <Link href={`/products/${variant.product.slug}?variant=${variant.id}`}>
                <ProductImage src={asset} size="thumbnail-big" alt={variant.name} title={variant.name} />
            </Link>
            <Stack gap="0.5rem" justifyBetween>
                <Stack column w100>
                    <TP
                        size="1.25rem"
                        weight={500}
                        style={{
                            whiteSpace: 'nowrap',
                        }}>
                        {variant.product.name}
                    </TP>
                    <Stack w100 itemsCenter justifyBetween>
                        {optionInName && (
                            <TP size="1.25rem" weight={400}>
                                {variant.name.replace(variant.product.name, '')}
                            </TP>
                        )}
                        <Price size="1.25rem" currencyCode={variant.currencyCode} price={variant.priceWithTax} />
                    </Stack>
                </Stack>
            </Stack>
            <Button
                onClick={e => {
                    e.stopPropagation();
                    addToCart(variant.id, 1, true);
                }}>
                {t('add-to-cart')}
            </Button>
        </Stack>
    );
};
