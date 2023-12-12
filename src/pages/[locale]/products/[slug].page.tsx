import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Facet } from '@/src/components/atoms/Facet';

import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP, TPriceBig } from '@/src/components/atoms/TypoGraphy';
import { Button, FullWidthButton, FullWidthSecondaryButton } from '@/src/components/molecules/Button';
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
import { InferGetStaticPropsType } from 'next';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { addToCart } = useCart();
    const { t } = useTranslation('common');
    const push = usePush();

    const language = props._nextI18Next?.initialLocale || 'en';

    const sizes = props.product?.variants.map(v => {
        return {
            id: v.id,
            size: v.name.replace(props.product?.name || '', ''),
        };
    });

    const [size, setSize] = useState<{
        id: string;
        size: string;
    }>({
        id: props.product?.variants[0].id || '',
        size: props.product?.variants[0].name.replace(props.product?.name || '', '') || '',
    });

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
                        {sizes && sizes?.length > 1 ? (
                            <StyledStack gap="0.5rem">
                                {sizes.map(s => (
                                    <SizeSelector key={s.id} onClick={() => setSize(s)} selected={s.id === size?.id}>
                                        {s.size}
                                    </SizeSelector>
                                ))}
                            </StyledStack>
                        ) : null}
                        <Stack gap="1rem">
                            <TPriceBig>
                                {priceFormatter(
                                    props.product?.variants[0].priceWithTax || 0,
                                    props.product?.variants[0].currencyCode || CurrencyCode.USD,
                                )}
                            </TPriceBig>
                            <TPriceBig>{props.product?.variants[0].currencyCode}</TPriceBig>
                        </Stack>
                        <TP>{props.product?.description}</TP>
                        <Stack gap="2.5rem" justifyBetween column>
                            <FullWidthSecondaryButton
                                onClick={() => props.product?.id && size?.id && addToCart(size.id, 1)}>
                                {t('add-to-cart')}
                            </FullWidthSecondaryButton>
                            <FullWidthButton
                                onClick={() => {
                                    if (props.product?.id && size?.id) addToCart(size.id, 1);
                                    push('/checkout');
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
