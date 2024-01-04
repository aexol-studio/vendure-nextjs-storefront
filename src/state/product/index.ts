import { createContainer } from 'unstated-next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ProductDetailType } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import { useCart } from '@/src/state/cart';
import { ProductContainerType, Variant } from './types';
import { productEmptyState } from './utils';

const useProductContainer = createContainer<ProductContainerType, { product: ProductDetailType }>(initialState => {
    if (!initialState?.product) return productEmptyState;
    const { t } = useTranslation('common');
    const push = usePush();
    const { addToCart } = useCart();
    const [variant, setVariant] = useState<Variant | undefined>(initialState.product?.variants[0]);
    const [addingError, setAddingError] = useState<string | undefined>();
    const { query } = useRouter();

    useEffect(() => {
        setVariant(initialState.product?.variants[0]);
    }, [initialState.product]);

    useEffect(() => {
        if (typeof window === 'undefined' || !initialState.product) return;
        if (initialState.product.variants.length) {
            const url = new URL(window.location.href);
            url.searchParams.set('variant', variant?.id ?? initialState.product.variants[0].id);
            window.history.replaceState({}, '', url.pathname + url.search);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !query.variant || !initialState.product) return;
        const variant = initialState.product?.variants.find(v => v.id === query.variant);
        setVariant(variant);
    }, [query.variant]);

    const handleVariant = (variant?: Variant) => {
        const url = new URL(window.location.href);
        if (variant) {
            url.searchParams.set('variant', variant.id);
            setAddingError(undefined);
        } else url.searchParams.delete('variant');
        setVariant(variant);
        window.history.replaceState({}, '', url.pathname + url.search);
    };

    const handleAddToCart = async () => {
        if (variant?.id) await addToCart(variant.id, 1, true);
        else setAddingError(t('select-options'));
    };

    const handleBuyNow = async () => {
        if (variant?.id) {
            await addToCart(variant.id, 1);
            push('/checkout');
        } else setAddingError(t('select-options'));
    };

    return {
        product: initialState.product,
        variant,
        setVariant,
        handleVariant,
        addingError,
        setAddingError,
        handleAddToCart,
        handleBuyNow,
    };
});

export const useProduct = useProductContainer.useContainer;
export const ProductProvider = useProductContainer.Provider;
