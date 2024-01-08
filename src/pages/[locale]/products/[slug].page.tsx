import React from 'react';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Facet } from '@/src/components/atoms/Facet';

import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP, TPriceBig } from '@/src/components/atoms/TypoGraphy';
import { FullWidthButton, FullWidthSecondaryButton } from '@/src/components/molecules/Button';
import { NotifyMeForm } from '@/src/components/molecules/NotifyMeForm';
import { NewestProducts } from '@/src/components/organisms/NewestProducts';
import { ProductPhotosPreview } from '@/src/components/organisms/ProductPhotosPreview';
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

const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { product, variant, addingError, handleVariant, handleBuyNow, handleAddToCart } = useProduct();
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
                            {/* <DesktopPhotoSwipe
                                galleryID="product"
                                images={
                                    product?.assets.map(a => ({
                                        src: a.preview,
                                        width: a.width,
                                        height: a.height,
                                        alt: product.name,
                                    })) || []
                                }
                            /> */}
                            <ProductPhotosPreview featuredAsset={product?.featuredAsset} images={product?.assets} />
                        </StickyLeft>
                        <StyledStack column gap="2.5rem">
                            <TH1>{product?.name}</TH1>
                            {product && product.variants.length > 1 ? (
                                <ProductOptions
                                    optionGroups={props.optionGroups}
                                    variants={product.variants}
                                    selectedVariant={variant}
                                    setVariant={handleVariant}
                                    addingError={addingError}
                                />
                            ) : (
                                <FacetContainer gap="1rem">
                                    {product?.facetValues.map(({ id, name }) => <Facet key={id}>{name}</Facet>)}
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
                                    <TPriceBig>{product?.variants[0].currencyCode}</TPriceBig>
                                </Stack>
                            </Stack>
                            <Stack gap="1rem" column>
                                {Number(variant?.stockLevel) > 0 && Number(variant?.stockLevel) <= 10 && (
                                    <MakeItQuick size="1.25rem" weight={400}>
                                        <Trans
                                            i18nKey="stockLevel.LOW_STOCK"
                                            t={t}
                                            values={{ value: variant?.stockLevel }}
                                            components={{ 1: <span></span> }}
                                        />
                                    </MakeItQuick>
                                )}
                                <StockInfo outOfStock={Number(variant?.stockLevel) <= 0} itemsCenter gap="0.25rem">
                                    {Number(variant?.stockLevel) <= 0 ? <X /> : <Check size="1.75rem" />}
                                    <TP>
                                        {Number(variant?.stockLevel || 0) > 0
                                            ? t('stockLevel.IN_STOCK')
                                            : t('stockLevel.OUT_OF_STOCK')}
                                    </TP>
                                </StockInfo>
                            </Stack>
                            <TP>{product?.description}</TP>
                            {Number(variant?.stockLevel) <= 0 ? (
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
        navigation,
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
];
