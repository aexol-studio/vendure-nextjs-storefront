import { createContainer } from 'unstated-next';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ProductDetailType } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import { useCart } from '@/src/state/cart';
import { OptionGroupWithStock, ProductContainerType, Variant } from './types';
import { findRelatedVariant, productEmptyState, setRecentlyViewedInCookie } from './utils';

const useProductContainer = createContainer<ProductContainerType, { product: ProductDetailType }>(initialState => {
    if (!initialState?.product) return productEmptyState;
    const { t } = useTranslation('common');
    const push = usePush();
    const { addToCart } = useCart();
    const [selectedOptions, setSelectedOptions] = useState<{
        [key: string]: string;
    }>({});
    const [variant, setVariant] = useState<Variant | undefined>(initialState.product?.variants[0]);
    const [addingError, setAddingError] = useState<string | undefined>();
    const { asPath } = useRouter();

    useEffect(() => {
        setVariant(initialState.product?.variants[0]);
    }, [initialState.product]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URLSearchParams(window.location.search);
        const query = url.get('variant');
        if (!initialState.product || !variant || query) return;
        if (initialState.product.variants.length) {
            const url = new URL(window.location.href);
            url.searchParams.set('variant', initialState.product.variants[0].id);
            window.history.replaceState({}, '', url.pathname + url.search);
        }
    }, [initialState.product]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const url = new URLSearchParams(window.location.search);
        const query = url.get('variant');
        if (!query || !initialState.product) return;
        const variant = initialState.product?.variants.find(v => v.id === query);

        try {
            if (variant) {
                const cookie = window.document.cookie
                    .split(';')
                    .map(c => c.trim())
                    .find(c => c.startsWith('recentlyViewed='));
                if (cookie) {
                    const recentlyViewed = setRecentlyViewedInCookie(cookie, variant?.id);
                    window.document.cookie = `recentlyViewed=${recentlyViewed};path=/;max-age=31536000`;
                } else {
                    window.document.cookie = `recentlyViewed=${variant?.id};path=/;max-age=31536000`;
                }
            }
        } catch (error) {
            console.log(error);
        }

        setVariant(variant);
        const newState = variant?.options.reduce(
            (acc, option) => {
                acc[option.groupId] = option.id;
                return acc;
            },
            {} as { [key: string]: string },
        );
        if (newState) setSelectedOptions(newState);
    }, [asPath]);

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

    const handleOptionClick = (groupId: string, id: string) => {
        let newState: { [key: string]: string };
        if (selectedOptions[groupId] === id) {
            return;
        } else {
            newState = { ...selectedOptions, [groupId]: id };
        }
        setSelectedOptions(newState);
        const newVariant = initialState.product.variants.find(v =>
            v.options.every(ov => ov.id === newState[ov.groupId]),
        );
        if (newVariant && newVariant !== variant) handleVariant(newVariant);
        else handleVariant(undefined);
    };

    const productOptionsGroups = useMemo(() => {
        return initialState.product.optionGroups.map(group => {
            const options = group.options
                .map(option => {
                    const relatedVariant = findRelatedVariant(initialState.product, group, option, selectedOptions);
                    return relatedVariant
                        ? {
                              ...option,
                              //HERE WE CAN COPY SOME VALUES FROM VARIANT
                              stockLevel: Number(relatedVariant.stockLevel),
                              isSelected: option.id === selectedOptions[group.id],
                          }
                        : undefined;
                })
                .filter(Boolean) as OptionGroupWithStock[];

            return { ...group, options };
        });
    }, [selectedOptions, initialState.product, variant]);

    return {
        product: initialState.product,
        variant,
        setVariant,
        handleVariant,
        addingError,
        setAddingError,
        handleAddToCart,
        handleBuyNow,
        handleOptionClick,
        productOptionsGroups,
    };
});

export const useProduct = useProductContainer.useContainer;
export const ProductProvider = useProductContainer.Provider;
