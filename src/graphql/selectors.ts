import { scalars } from '@/src/graphql/client';
import { FromSelector, Selector } from '@/src/zeus';

export type OrderStateType =
    | 'Created'
    | 'Draft'
    | 'AddingItems'
    | 'Cancelled'
    | 'ArrangingPayment'
    | 'PaymentAuthorized'
    | 'PaymentSettled'
    | 'PartiallyShipped'
    | 'Shipped'
    | 'PartiallyDelivered'
    | 'Delivered'
    | 'Modifying'
    | 'ArrangingAdditionalPayment';

export type FiltersFacetType = FacetType & { values: (FacetType & { count: number })[] };

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
    facetIds: true,
    facetValueIds: true,
    productAsset: {
        preview: true,
    },
});
export type ProductSearchType = FromSelector<typeof ProductSearchSelector, 'SearchResult', typeof scalars>;

export const FacetSelector = Selector('Facet')({
    id: true,
    name: true,
    code: true,
});

export type FacetType = FromSelector<typeof FacetSelector, 'Facet', typeof scalars>;

export const SearchSelector = Selector('SearchResponse')({
    items: ProductSearchSelector,
    totalItems: true,
    facetValues: {
        count: true,
        facetValue: {
            ...FacetSelector,
            facet: FacetSelector,
        },
    },
});

export type SearchType = FromSelector<typeof SearchSelector, 'SearchResponse', typeof scalars>;

export const ProductSlugSelector = Selector('Product')({
    name: true,
    description: true,
    id: true,
    slug: true,
});

export const ProductDetailsFacetSelector = Selector('FacetValue')({
    name: true,
    id: true,
    translations: { name: true, languageCode: true, id: true },
});

export type ProductDetailsFacetType = FromSelector<typeof ProductDetailsFacetSelector, 'FacetValue', typeof scalars>;

export const ProductDetailSelector = Selector('Product')({
    name: true,
    description: true,
    id: true,
    slug: true,
    optionGroups: {
        name: true,
        id: true,
        code: true,
        options: {
            name: true,
            id: true,
            code: true,
        },
    },
    assets: {
        source: true,
        preview: true,
    },
    collections: {
        id: true,
        name: true,
        slug: true,
        featuredAsset: { preview: true },
    },
    variants: {
        id: true,
        name: true,
        currencyCode: true,
        priceWithTax: true,
        stockLevel: true,
        options: {
            id: true,
            groupId: true,
            group: { id: true },
            code: true,
            name: true,
        },
    },
    featuredAsset: {
        source: true,
        preview: true,
    },

    facetValues: ProductDetailsFacetSelector,
});

export type ProductDetailType = FromSelector<typeof ProductDetailSelector, 'Product', typeof scalars>;

export const NewestProductSelector = Selector('Product')({
    name: true,
    slug: true,
    featuredAsset: {
        source: true,
        preview: true,
    },
});

export type NewestProductType = FromSelector<typeof NewestProductSelector, 'Product', typeof scalars>;

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

export const AvailableCountriesSelector = Selector('Country')({
    code: true,
    name: true,
    languageCode: true,
});
export type AvailableCountriesType = FromSelector<typeof AvailableCountriesSelector, 'Country', typeof scalars>;

export const OrderAddressSelector = Selector('OrderAddress')({
    fullName: true,
    company: true,
    streetLine1: true,
    streetLine2: true,
    city: true,
    province: true,
    postalCode: true,
    phoneNumber: true,
});

export type OrderAddressType = FromSelector<typeof OrderAddressSelector, 'OrderAddress', typeof scalars>;

export const ActiveAddressSelector = Selector('Address')({
    ...OrderAddressSelector,
    id: true,
    country: AvailableCountriesSelector,
    defaultShippingAddress: true,
    defaultBillingAddress: true,
});

export type ActiveAddressType = FromSelector<typeof ActiveAddressSelector, 'Address', typeof scalars>;

export const EditActiveAddressSelector = Selector('UpdateAddressInput')({
    id: true,
    fullName: true,
    company: true,
    streetLine1: true,
    streetLine2: true,
    city: true,
    province: true,
    postalCode: true,
    countryCode: true,
    phoneNumber: true,
    defaultShippingAddress: true,
    defaultBillingAddress: true,
});

export type EditActiveAddressType = FromSelector<
    typeof EditActiveAddressSelector,
    'UpdateAddressInput',
    typeof scalars
>;

export const CurrentUserSelector = Selector('CurrentUser')({
    id: true,
    identifier: true,
});

export type CurrentUserType = FromSelector<typeof CurrentUserSelector, 'CurrentUser', typeof scalars>;

export const ActiveCustomerSelector = Selector('Customer')({
    id: true,
    lastName: true,
    firstName: true,
    emailAddress: true,
    phoneNumber: true,
    addresses: ActiveAddressSelector,
    user: CurrentUserSelector,
});

export type ActiveCustomerType = FromSelector<typeof ActiveCustomerSelector, 'Customer', typeof scalars>;

export const paymentSelector = Selector('Payment')({
    id: true,
    method: true,
    amount: true,
    state: true,
    errorMessage: true,
});

export type PaymentType = FromSelector<typeof paymentSelector, 'Payment', typeof scalars>;

export const discountsSelector = Selector('Discount')({
    type: true,
    description: true,
    amountWithTax: true,
    adjustmentSource: true,
});

export type DiscountsType = FromSelector<typeof discountsSelector, 'Discount', typeof scalars>;

export const ActiveOrderSelector = Selector('Order')({
    id: true,
    createdAt: true,
    updatedAt: true,
    totalQuantity: true,
    shippingWithTax: true,
    totalWithTax: true,
    subTotalWithTax: true,
    discounts: discountsSelector,
    active: true,
    lines: {
        id: true,
        quantity: true,
        linePriceWithTax: true,
        unitPriceWithTax: true,
        discountedLinePriceWithTax: true,
        featuredAsset: {
            id: true,
            preview: true,
        },
        productVariant: {
            name: true,
            id: true,
            sku: true,
            price: true,
            featuredAsset: {
                id: true,
                source: true,
            },
            product: {
                name: true,
            },
        },
    },
    shippingLines: {
        shippingMethod: {
            id: true,
            name: true,
            description: true,
        },
        priceWithTax: true,
    },
    state: true,
    couponCodes: true,
    currencyCode: true,
    code: true,
    payments: paymentSelector,
    customer: { id: true, emailAddress: true, firstName: true, lastName: true, phoneNumber: true },
});

export type ActiveOrderType = FromSelector<typeof ActiveOrderSelector, 'Order', typeof scalars>;

export const OrderSelector = Selector('Order')({
    state: true,
    active: true,
    payments: paymentSelector,
    subTotalWithTax: true,
    shippingWithTax: true,
    currencyCode: true,
    totalWithTax: true,
    discounts: discountsSelector,
    lines: {
        id: true,
        quantity: true,
        linePriceWithTax: true,
        unitPriceWithTax: true,
        discountedLinePriceWithTax: true,
        featuredAsset: {
            id: true,
            preview: true,
        },
        productVariant: {
            name: true,
            currencyCode: true,
            featuredAsset: {
                id: true,
                source: true,
            },
            product: {
                name: true,
            },
        },
    },
    shippingLines: {
        shippingMethod: {
            id: true,
            description: true,
        },
        priceWithTax: true,
    },
});
export type OrderType = FromSelector<typeof OrderSelector, 'Order', typeof scalars>;
export const ShippingMethodsSelector = Selector('ShippingMethodQuote')({
    id: true,
    name: true,
    price: true,
    description: true,
});

export type ShippingMethodType = FromSelector<typeof ShippingMethodsSelector, 'ShippingMethodQuote', typeof scalars>;

export const AvailablePaymentMethodsSelector = Selector('PaymentMethodQuote')({
    id: true,
    name: true,
    description: true,
    code: true,
    isEligible: true,
});

export type AvailablePaymentMethodsType = FromSelector<
    typeof AvailablePaymentMethodsSelector,
    'PaymentMethodQuote',
    typeof scalars
>;

export const CreateCustomerSelector = Selector('CreateCustomerInput')({
    emailAddress: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
});

export type CreateCustomerType = FromSelector<typeof CreateCustomerSelector, 'CreateCustomerInput', typeof scalars>;

export const CreateAddressSelector = Selector('CreateAddressInput')({
    fullName: true,
    company: true,
    streetLine1: true,
    streetLine2: true,
    city: true,
    province: true,
    postalCode: true,
    countryCode: true,
    phoneNumber: true,
    defaultShippingAddress: true,
    defaultBillingAddress: true,
});

export type CreateAddressType = FromSelector<typeof CreateAddressSelector, 'CreateAddressInput', typeof scalars>;

export const RegisterCustomerInputSelector = Selector('RegisterCustomerInput')({
    emailAddress: true,
    password: true,
});

export type RegisterCustomerInputType = FromSelector<
    typeof RegisterCustomerInputSelector,
    'RegisterCustomerInput',
    typeof scalars
>;

export type LoginCustomerInputType = {
    emailAddress: string;
    password: string;
    rememberMe: boolean;
};

export const YAMLProductsSelector = Selector('Product')({
    id: true,
    name: true,
    slug: true,
    featuredAsset: {
        source: true,
        preview: true,
    },
    collections: {
        name: true,
        slug: true,
    },
    variants: {
        id: true,
        name: true,
        currencyCode: true,
        priceWithTax: true,
        stockLevel: true,
        assets: {
            source: true,
            preview: true,
        },
        featuredAsset: {
            source: true,
            preview: true,
        },
    },
});

export type YAMLProductsType = FromSelector<typeof YAMLProductsSelector, 'Product', typeof scalars>;
