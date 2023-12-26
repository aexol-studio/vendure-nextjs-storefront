import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Facet } from '@/src/components/atoms/Facet';

import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP, TPriceBig } from '@/src/components/atoms/TypoGraphy';
import { FullWidthButton, FullWidthSecondaryButton } from '@/src/components/molecules/Button';
import { NotifyMeForm } from '@/src/components/molecules/NotifyMeForm';
import { NewestProducts } from '@/src/components/organisms/NewestProducts';
import { ProductPhotosPreview } from '@/src/components/organisms/ProductPhotosPreview';
import { RelatedProductCollections } from '@/src/components/organisms/RelatedProductCollections';
import { storefrontApiQuery } from '@/src/graphql/client';
import {
    NewestProductSelector,
    ProductDetailSelector,
    ProductDetailType,
    ProductSlugSelector,
} from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { ContextModel, localizeGetStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { usePush } from '@/src/lib/redirect';
import { useCart } from '@/src/state/cart';
import { priceFormatter } from '@/src/util/priceFomatter';
import { translateProductFacetsNames } from '@/src/util/translateFacetsNames';
import { CurrencyCode, SortOrder } from '@/src/zeus';
import styled from '@emotion/styled';
import { Check, X } from 'lucide-react';
import { InferGetStaticPropsType } from 'next';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ProductOptions } from '@/src/components/organisms/ProductOptions';

type Variant = ProductDetailType['variants'][number];

const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { addToCart } = useCart();
    const { query } = useRouter();
    const push = usePush();
    const { t } = useTranslation('common');
    const [variant, setVariant] = useState<Variant | undefined>(
        props.product.variants.length === 1 ? props.product.variants[0] : undefined,
    );
    const [addingError, setAddingError] = useState<string | undefined>();

    const translatedStockLevel = t('stockLevel', { returnObjects: true });
    const language = props._nextI18Next?.initialLocale || 'en';

    useEffect(() => {
        if (typeof window === 'undefined' || !props.product) return;
        if (props.product.variants.length === 1) {
            const url = new URL(window.location.href);
            url.searchParams.set('variant', props.product.variants[0].id);
            push(url.pathname + url.search);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !query.variant || !props.product) return;
        const variant = props.product?.variants.find(v => v.id === query.variant);
        setVariant(variant);
    }, [query.variant]);

    const handleVariant = (variant?: Variant) => {
        const url = new URL(window.location.href);
        if (variant) {
            url.searchParams.set('variant', variant.id);
            setAddingError(undefined);
        } else url.searchParams.delete('variant');
        setVariant(variant);
        push(url.pathname + url.search);
    };

    const handleAddToCart = async () => {
        if (variant?.id) await addToCart(variant.id, 1, true);
        else setAddingError(t('select-options'));
    };

    const handleBuyNow = async () => {
        if (variant?.id) {
            const added = await addToCart(variant.id, 1);
            if (added) push('/checkout');
        } else setAddingError(t('select-options'));
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Main gap="5rem">
                    <StickyLeft w100 itemsCenter justifyCenter gap="2.5rem">
                        <ProductPhotosPreview
                            featuredAsset={props.product?.featuredAsset}
                            images={props.product?.assets}
                        />
                    </StickyLeft>
                    <StyledStack column gap="2.5rem">
                        <TH1>{props.product?.name}</TH1>
                        {props.product.variants.length > 1 ? (
                            <ProductOptions
                                optionGroups={props.optionGroups}
                                variants={props.product.variants}
                                selectedVariant={variant}
                                setVariant={handleVariant}
                                addingError={addingError}
                            />
                        ) : (
                            <FacetContainer gap="1rem">
                                {translateProductFacetsNames(language, props.product?.facetValues).map(
                                    ({ id, name }) => (
                                        <Facet key={id}>{name}</Facet>
                                    ),
                                )}
                            </FacetContainer>
                        )}

                        <Stack justifyBetween itemsCenter>
                            <Stack gap="1rem">
                                <TPriceBig>
                                    {priceFormatter(
                                        variant?.priceWithTax || 0,
                                        variant?.currencyCode || CurrencyCode.USD,
                                    )}
                                </TPriceBig>
                                <TPriceBig>{props.product?.variants[0].currencyCode}</TPriceBig>
                            </Stack>
                        </Stack>
                        <Stack gap="1rem">
                            <StockInfo outOfStock={variant?.stockLevel === 'OUT_OF_STOCK'} itemsCenter gap="0.25rem">
                                {variant?.stockLevel === 'OUT_OF_STOCK' ? <X /> : <Check size="1.75rem" />}
                                <TP>
                                    {translatedStockLevel[variant?.stockLevel as keyof typeof translatedStockLevel]}
                                </TP>
                            </StockInfo>
                        </Stack>
                        <TP>{props.product?.description}</TP>
                        {variant?.stockLevel === 'OUT_OF_STOCK' ? (
                            <NotifyMeForm />
                        ) : (
                            <Stack w100 gap="2.5rem" justifyBetween column>
                                <FullWidthSecondaryButton onClick={handleAddToCart}>
                                    {t('add-to-cart')}
                                </FullWidthSecondaryButton>
                                <FullWidthButton onClick={handleBuyNow}>{t('buy-now')}</FullWidthButton>
                            </Stack>
                        )}
                    </StyledStack>
                </Main>
                <RelatedProductCollections collections={props.product?.collections} />
                <NewestProducts products={props.newestProducts.products.items} />
            </ContentContainer>
        </Layout>
    );
};

const StickyLeft = styled(Stack)`
    @media (min-width: 1024px) {
        position: sticky;
        top: 12rem;
    }
`;

const StockInfo = styled(Stack)<{ outOfStock?: boolean }>`
    white-space: nowrap;
    color: ${p => (p.outOfStock ? p.theme.error : 'inherit')};
    width: max-content;
    @media (min-width: 1024px) {
        width: 100%;
    }
`;

const StyledStack = styled(Stack)`
    justify-content: center;
    align-items: center;
    @media (min-width: 1024px) {
        justify-content: flex-start;
        align-items: flex-start;
    }
`;

const FacetContainer = styled(Stack)`
    flex-wrap: wrap;
    justify-content: center;
    @media (min-width: 1024px) {
        justify-content: flex-start;
    }
`;

const Main = styled(Stack)`
    padding: 1.5rem 0;
    flex-direction: column;
    align-items: start;
    @media (min-width: 1024px) {
        flex-direction: row;
        padding: 4rem 0;
    }
    border-bottom: 1px solid ${({ theme }) => theme.gray(100)};
`;

export const getStaticPaths = async () => {
    const resp = await storefrontApiQuery({
        products: [{}, { items: ProductSlugSelector }],
    });
    const paths = localizeGetStaticPaths(
        resp.products.items.map(product => ({
            params: { id: product.id, slug: product.slug },
        })),
    );
    return { paths, fallback: false };
};

export const getStaticProps = async (context: ContextModel<{ slug?: string }>) => {
    const { slug } = context.params || {};
    const response =
        typeof slug === 'string'
            ? await storefrontApiQuery({
                  product: [{ slug }, ProductDetailSelector],
              })
            : null;
    if (!response?.product) return { notFound: true };
    const r = await makeStaticProps(['common'])(context);

    const collections = await getCollections();
    const newestProducts = await storefrontApiQuery({
        products: [{ options: { take: 10, sort: { createdAt: SortOrder.DESC } } }, { items: NewestProductSelector }],
    });

    const { optionGroups: _optionGroups, ...product } = response.product;

    //mapping option groups to match the color names <-> hex codes
    // const getFacetsValues = await storefrontApiQuery({
    //     facets: [{ options: { filter: { name: { eq: 'color' } } } }, { items: { values: { name: true, code: true } } }],
    // });
    // const optionGroups = _optionGroups.map(og => ({
    //     ...og,
    //     options: og.options.map(o => ({
    //         ...o,
    //         name:
    //             getFacetsValues.facets.items[0].values.find(v => v.name.toLowerCase() === o.code.toLowerCase())?.code ||
    //             o.name,
    //     })),
    // }));

    const optionGroups = _optionGroups.map(og => ({
        ...og,
        options: og.options.map(o => ({
            ...o,
            name: notInDemoStore.find(v => v.code.toLowerCase() === o.code.toLowerCase())?.name || o.name,
        })),
    }));

    const returnedStuff = {
        slug: context.params?.slug,
        optionGroups,
        product,
        collections,
        newestProducts,
        ...r.props,
    };

    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export default ProductPage;

//THIS IS NOT IN DEMO STORE - BUT MAKE SENSE TO KEEP IT LIKE THIS
const notInDemoStore = [
    { name: 'blue', code: '#0000FF' },
    { name: 'pink', code: '#FFC0CB' },
    { name: 'black', code: '#000000' },
    { name: 'gray', code: '#808080' },
    { name: 'brown', code: '#964B00' },
    { name: 'wood', code: '#A1662F' },
    { name: 'yellow', code: '#FFFF00' },
    { name: 'green', code: '#008000' },
    { name: 'white', code: '#FFFFFF' },
];
