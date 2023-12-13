import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Facet } from '@/src/components/atoms/Facet';

import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP, TPriceBig } from '@/src/components/atoms/TypoGraphy';
import { Button, FullWidthButton, FullWidthSecondaryButton } from '@/src/components/molecules/Button';
import { NotifyMeform } from '@/src/components/molecules/NotifyMeForm';
import { NewestProducts } from '@/src/components/organisms/NewestProducts';
import { ProductPhotosPreview } from '@/src/components/organisms/ProductPhotosPreview';
import { RelatedProductCollections } from '@/src/components/organisms/RelatedProductCollections';
import { storefrontApiQuery } from '@/src/graphql/client';
import { NewestProductSelector, ProductDetailSelector, ProductSlugSelector } from '@/src/graphql/selectors';
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

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { addToCart } = useCart();
    const push = usePush();
    const { t } = useTranslation('common');
    const translatedStockLevel = t('stockLevel', { returnObjects: true });

    const language = props._nextI18Next?.initialLocale || 'en';

    const variants = props.product?.variants.map(v => {
        return {
            id: v.id,
            size: v.name.replace(props.product?.name || '', ''),
            stockLevel: v.stockLevel,
        };
    });

    const [variant, setVariant] = useState<{
        id: string;
        size: string;
        stockLevel: string;
    }>({
        id: props.product?.variants[0].id || '',
        size: props.product?.variants[0].name.replace(props.product?.name || '', '') || '',
        stockLevel: props.product?.variants[0].stockLevel || 'OUT_OF_STOCK',
    });

    const isOutOfStock = useMemo(() => variant.stockLevel === 'OUT_OF_STOCK', [variant]);
    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Main gap="5rem">
                    <ProductPhotosPreview featuredAsset={props.product?.featuredAsset} images={props.product?.assets} />
                    <StyledStack column gap="2.5rem">
                        <TH1>{props.product?.name}</TH1>
                        <FasetContainer gap="1rem">
                            {translateProductFacetsNames(language, props.product?.facetValues).map(({ id, name }) => (
                                <Facet key={id}>{name}</Facet>
                            ))}
                        </FasetContainer>
                        {variants && variants?.length > 1 ? (
                            <StyledStack gap="0.5rem">
                                {variants.map(s => (
                                    <SizeSelector
                                        key={s.id}
                                        onClick={() => setVariant(s)}
                                        selected={s.id === variant?.id}>
                                        {s.size}
                                    </SizeSelector>
                                ))}
                            </StyledStack>
                        ) : null}
                        <Stack justifyBetween itemsCenter>
                            <Stack gap="1rem">
                                <TPriceBig>
                                    {priceFormatter(
                                        props.product?.variants[0].priceWithTax || 0,
                                        props.product?.variants[0].currencyCode || CurrencyCode.USD,
                                    )}
                                </TPriceBig>
                                <TPriceBig>{props.product?.variants[0].currencyCode}</TPriceBig>
                            </Stack>
                        </Stack>
                        <Stack gap="1rem">
                            <StockInfo outOfStock={isOutOfStock} itemsCenter gap="0.25rem">
                                {isOutOfStock ? <X /> : <Check size="1.75rem" />}
                                <TP>{translatedStockLevel[variant.stockLevel as keyof typeof translatedStockLevel]}</TP>
                            </StockInfo>

                            {isOutOfStock ? <NotifyMeform /> : null}
                        </Stack>
                        <TP>{props.product?.description}</TP>
                        <Stack gap="2.5rem" justifyBetween column>
                            <FullWidthSecondaryButton
                                disabled={isOutOfStock}
                                onClick={() => props.product?.id && variant?.id && addToCart(variant.id, 1)}>
                                {t('add-to-cart')}
                            </FullWidthSecondaryButton>
                            <FullWidthButton
                                disabled={isOutOfStock}
                                onClick={() => {
                                    if (props.product?.id && variant?.id && !isOutOfStock) {
                                        addToCart(variant.id, 1);
                                        push('/checkout');
                                    }
                                }}>
                                {t('buy-now')}
                            </FullWidthButton>
                        </Stack>
                    </StyledStack>
                </Main>
                <RelatedProductCollections collections={props.product?.collections} />
                <NewestProducts products={props.newestProducts.products.items} />
            </ContentContainer>
        </Layout>
    );
};

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

const FasetContainer = styled(Stack)`
    flex-wrap: wrap;
    justify-content: center;
    @media (min-width: 1024px) {
        justify-content: flex-start;
    }
`;

const SizeSelector = styled(Button)<{ selected: boolean }>`
    border: 1px solid ${p => p.theme.gray(500)};
    background: ${p => p.theme.gray(0)};
    color: ${p => p.theme.gray(900)};
    :hover {
        background: ${p => p.theme.gray(500)};
        color: ${p => p.theme.gray(0)};
    }
    ${p =>
        p.selected &&
        `
        background: ${p.theme.gray(1000)};
        color: ${p.theme.gray(0)};
    `}
`;
const Main = styled(Stack)`
    padding: 1%.5 0;
    flex-direction: column;
    align-items: center;
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
    const collections = await getCollections();
    const newestProducts = await storefrontApiQuery({
        products: [{ options: { take: 10, sort: { createdAt: SortOrder.DESC } } }, { items: NewestProductSelector }],
    });
    const response =
        typeof slug === 'string'
            ? await storefrontApiQuery({
                  product: [{ slug }, ProductDetailSelector],
              })
            : undefined;
    const r = await makeStaticProps(['common'])(context);

    const returnedStuff = {
        slug: context.params?.slug,
        product: response?.product,
        collections: collections,
        newestProducts: newestProducts,
        ...r.props,
    };
    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export default ProductPage;
