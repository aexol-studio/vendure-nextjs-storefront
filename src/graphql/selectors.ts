import { scalars } from '@/src/graphql/client';
import { FromSelector, Selector } from '@/src/zeus';

export const ProductTileSelector = Selector('Product')({
    id: true,
    name: true,
    slug: true,
    collections: {
        name: true,
        slug: true,
    },
    variants: {
        currencyCode: true,
        price: true,
    },
    featuredAsset: {
        source: true,
        preview: true,
    },
});
export const ProductSearchSelector = Selector('SearchResult')({
    productName: true,
    slug: true,
    collectionIds: true,
    currencyCode: true,
    priceWithTax: {
        '...on PriceRange': {
            max: true,
            min: true,
        },
        '...on SinglePrice': {
            value: true,
        },
    },
    productAsset: {
        preview: true,
    },
});
export type ProductSearchType = FromSelector<typeof ProductSearchSelector, 'SearchResult', typeof scalars>;

export const FacetSelector = Selector('Facet')({
    name: true,
    code: true,
    values: {
        name: true,
        id: true,
    },
});

export type FacetType = FromSelector<typeof FacetSelector, 'Facet', typeof scalars>;

export const ProductSlugSelector = Selector('Product')({
    name: true,
    description: true,
    id: true,
    slug: true,
});

export const ProductDetailSelector = Selector('Product')({
    name: true,
    description: true,
    id: true,
    slug: true,
    assets: {
        source: true,
        preview: true,
    },
    collections: {
        name: true,
        slug: true,
    },
    variants: {
        currencyCode: true,
        price: true,
    },
    featuredAsset: {
        source: true,
        preview: true,
    },
});

export type ProductTileType = FromSelector<typeof ProductTileSelector, 'Product', typeof scalars>;

export const CollectionTileSelector = Selector('Collection')({
    name: true,
    id: true,
    slug: true,
});

export type CollectionTileType = FromSelector<typeof CollectionTileSelector, 'Collection', typeof scalars>;

export const ProductVariantSelector = Selector('ProductVariant')({
    id: true,
    name: true,
    slug: true,
    collections: {
        name: true,
    },
    variants: {
        currencyCode: true,
        price: true,
    },
    featuredAsset: {
        source: true,
        preview: true,
    },
});

export const ActiveOrderSelector = Selector('Order')({
    id: true,
    totalQuantity: true,
    subTotalWithTax: true,
    shippingWithTax: true,
    totalWithTax: true,
    discounts: {
        description: true,
        amountWithTax: true,
    },
    active: true,
    total: true,
    billingAddress: {
        city: true,
        country: true,
    },
    lines: {
        id: true,
        quantity: true,
        linePriceWithTax: true,
        unitPriceWithTax: true,
        featuredAsset: {
            id: true,
            preview: true,
        },
        productVariant: {
            name: true,
            id: true,
            sku: true,
        },
    },
    shippingLines: {
        shippingMethod: {
            description: true,
        },
        priceWithTax: true,
    },
    state: true,
    couponCodes: true,
    currencyCode: true,
    code: true,
});

export type ActiveOrderType = FromSelector<typeof ActiveOrderSelector, 'Order', typeof scalars>;
