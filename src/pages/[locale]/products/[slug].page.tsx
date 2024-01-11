import React from 'react';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Facet } from '@/src/components/atoms/Facet';

import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP, TPriceBig } from '@/src/components/atoms/TypoGraphy';
import { FullWidthButton, FullWidthSecondaryButton } from '@/src/components/molecules/Button';
import { NotifyMeForm } from '@/src/components/molecules/NotifyMeForm';
import { NewestProducts } from '@/src/components/organisms/NewestProducts';
// import { ProductPhotosPreview } from '@/src/components/organisms/ProductPhotosPreview';
import { RelatedProductCollections } from '@/src/components/organisms/RelatedProductCollections';
import { DEFAULT_LANGUAGE, storefrontApiQuery } from '@/src/graphql/client';
import { NewestProductSelector, ProductDetailSelector, ProductSlugSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { ContextModel, localizeGetStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode, SortOrder } from '@/src/zeus';
import styled from '@emotion/styled';
import { Check, X } from 'lucide-react';
import { InferGetStaticPropsType } from 'next';

import { Trans, useTranslation } from 'next-i18next';
import { ProductOptions } from '@/src/components/organisms/ProductOptions';
import { Breadcrumbs } from '@/src/components/molecules/Breadcrumbs';
import { useProduct } from '@/src/state/product';
import { arrayToTree } from '@/src/util/arrayToTree';
import { ProductPhotosPreview } from '@/src/components/organisms/ProductPhotosPreview';

const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { product, variant, addingError, productOptionsGroups, handleOptionClick, handleBuyNow, handleAddToCart } =
        useProduct();
    const { t } = useTranslation('common');

    const breadcrumbs = [
        { name: t('home'), href: '/' },
        { name: props.product.name, href: `/products/${props.product.slug}` },
    ];

    return (
        <Layout categories={props.collections} navigation={props.navigation}>
            <ContentContainer>
                <Wrapper column>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                    <Main gap="5rem">
                        <StickyLeft w100 itemsCenter justifyCenter gap="2.5rem">
                            <ProductPhotosPreview
                                featuredAsset={product?.featuredAsset}
                                images={product?.assets}
                                name={product?.name}
                            />
                        </StickyLeft>
                        <StyledStack column gap="2.5rem">
                            <TH1>{product?.name}</TH1>
                            {product && product.variants.length > 1 ? (
                                <ProductOptions
                                    productOptionsGroups={productOptionsGroups}
                                    handleClick={handleOptionClick}
                                    addingError={addingError}
                                />
                            ) : (
                                <FacetContainer gap="1rem">
                                    {product?.facetValues.map(({ id, name }) => <Facet key={id}>{name}</Facet>)}
                                </FacetContainer>
                            )}

                            {variant && (
                                <Stack justifyBetween itemsCenter>
                                    <Stack gap="1rem">
                                        <TPriceBig>
                                            {priceFormatter(
                                                variant?.priceWithTax || 0,
                                                variant?.currencyCode || CurrencyCode.USD,
                                            )}
                                        </TPriceBig>
                                        <TPriceBig>{product?.variants[0].currencyCode}</TPriceBig>
                                    </Stack>
                                </Stack>
                            )}
                            <Stack gap="1rem" column>
                                {variant && Number(variant.stockLevel) > 0 && Number(variant.stockLevel) <= 10 && (
                                    <MakeItQuick size="1.25rem" weight={400}>
                                        <Trans
                                            i18nKey="stockLevel.LOW_STOCK"
                                            t={t}
                                            values={{ value: variant?.stockLevel }}
                                            components={{ 1: <span></span> }}
                                        />
                                    </MakeItQuick>
                                )}
                                <StockInfo
                                    comingSoon={!variant}
                                    outOfStock={Number(variant?.stockLevel) <= 0}
                                    itemsCenter
                                    gap="0.25rem">
                                    {!variant ? null : Number(variant.stockLevel) > 0 ? (
                                        <Check size="1.75rem" />
                                    ) : (
                                        <X />
                                    )}
                                    <TP>
                                        {!variant
                                            ? null
                                            : Number(variant.stockLevel) > 0
                                              ? t('stockLevel.IN_STOCK')
                                              : t('stockLevel.OUT_OF_STOCK')}
                                    </TP>
                                </StockInfo>
                            </Stack>
                            <TP>{product?.description}</TP>
                            {!variant ? null : Number(variant.stockLevel) <= 0 ? (
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
                    <NewestProducts products={props.newestProducts.products.items} />
                    <RelatedProductCollections collections={props?.collections} />
                </Wrapper>
            </ContentContainer>
        </Layout>
    );
};

const Wrapper = styled(Stack)`
    @media (min-width: ${p => p.theme.breakpoints.xl}) {
        padding: 3.5rem 0;
    }
`;

const MakeItQuick = styled(TP)`
    color: ${({ theme }) => theme.error};
`;

const StickyLeft = styled(Stack)`
    @media (min-width: 1024px) {
        position: sticky;
        top: 12rem;
    }
`;

const StockInfo = styled(Stack)<{ outOfStock?: boolean; comingSoon?: boolean }>`
    white-space: nowrap;
    color: ${p => (p.outOfStock ? p.theme.error : p.comingSoon ? p.theme.gray(800) : 'inherit')};
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
    margin-bottom: 2rem;
    border-bottom: 1px solid ${({ theme }) => theme.gray(100)};
`;

export const getStaticPaths = async () => {
    const resp = await storefrontApiQuery(DEFAULT_LANGUAGE)({
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
    const r = await makeStaticProps(['common'])(context);
    const language = r.props._nextI18Next?.initialLocale || 'en';
    const { slug } = context.params || {};
    const response =
        typeof slug === 'string'
            ? await storefrontApiQuery(language)({
                  product: [{ slug }, ProductDetailSelector],
              })
            : null;
    if (!response?.product) return { notFound: true };

    const collections = await getCollections(language);
    const navigation = arrayToTree(collections);

    const newestProducts = await storefrontApiQuery(language)({
        products: [{ options: { take: 10, sort: { createdAt: SortOrder.DESC } } }, { items: NewestProductSelector }],
    });

    const { optionGroups: _optionGroups, ...product } = response.product;

    // mapping option groups to match the color names <-> hex codes
    // const getFacetsValues = await storefrontApiQuery(language)({
    //     facets: [{ options: { filter: { name: { eq: 'color' } } } }, { items: { values: { name: true, code: true } } }],
    // });

    const optionGroups = _optionGroups.map(og => {
        return {
            ...og,
            options: og.options
                .sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name))
                .map(o => {
                    // mapping option groups to match the color names <-> hex codes
                    // const name =
                    //     getFacetsValues.facets.items[0].values.find(v => v.name.toLowerCase() === o.code.toLowerCase())
                    //         ?.code || o.name;

                    const name =
                        notInDemoStore.find(v => v.name.toLowerCase() === o.code.toLowerCase())?.code || o.name;
                    return { ...o, name };
                }),
        };
    });
    const returnedStuff = {
        slug: context.params?.slug,
        product: {
            ...product,
            optionGroups,
        },
        collections,
        newestProducts,
        navigation,
        language,
        ...r.props,
    };

    return {
        props: returnedStuff,
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
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
    { name: 'red', code: '#FF0000' },
    { name: 'mustard', code: '#FFDB58' },
    { name: 'mint', code: '#98FF98' },
    { name: 'pearl', code: '#FDEEF4' },
];
