import React, { useState } from 'react';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';

import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP } from '@/src/components/atoms/TypoGraphy';
import { FullWidthButton, FullWidthSecondaryButton } from '@/src/components/molecules/Button';
import { NotifyMeForm } from '@/src/components/molecules/NotifyMeForm';
import { NewestProducts } from '@/src/components/organisms/NewestProducts';
// import { ProductPhotosPreview } from '@/src/components/organisms/ProductPhotosPreview';
import { RelatedProductCollections } from '@/src/components/organisms/RelatedProductCollections';
import { Layout } from '@/src/layouts';
import styled from '@emotion/styled';
import { Check, MinusIcon, PlusIcon, X } from 'lucide-react';
import { InferGetStaticPropsType } from 'next';

import { Trans, useTranslation } from 'next-i18next';
import { ProductOptions } from '@/src/components/organisms/ProductOptions';
import { Breadcrumbs } from '@/src/components/molecules/Breadcrumbs';
import { useProduct } from '@/src/state/product';
import { ProductPhotosPreview } from '@/src/components/organisms/ProductPhotosPreview';
import { getStaticProps } from '@/src/components/pages/products/props';
import { Price } from '../../atoms';

export const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
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
                        <StyledStack w100 column gap="3.5rem">
                            <Stack column gap="1.5rem">
                                {Number(variant?.id) % 4 === 0 ? (
                                    <TP color="subtitle" upperCase>
                                        {t('best-seller')}
                                    </TP>
                                ) : null}
                                <TH1 size="2.5rem">{product?.name}</TH1>
                                {variant && <Price price={variant.priceWithTax} currencyCode={variant.currencyCode} />}
                            </Stack>
                            <Stack>
                                {product && product.variants.length > 1 ? (
                                    <ProductOptions
                                        productOptionsGroups={productOptionsGroups}
                                        handleClick={handleOptionClick}
                                        addingError={addingError}
                                    />
                                ) : null}
                            </Stack>
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
                            <MultiDescription
                                defaultOpenKeys={['Description']}
                                data={{
                                    'Product Information': (
                                        <Stack column style={{ marginTop: '2rem' }}>
                                            <Stack>
                                                <TP>SKU:</TP>
                                                <TP>&nbsp;{variant?.sku}</TP>
                                            </Stack>
                                            <Stack column>
                                                {variant?.options.map(option => (
                                                    <Stack key={option.code}>
                                                        <TP>{option.name}</TP>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    ),
                                    Description: <TP style={{ marginTop: '2rem' }}>{product?.description}</TP>,
                                }}
                            />
                        </StyledStack>
                    </Main>
                    <NewestProducts title={t('newest-products')} products={props.newestProducts.products.items} />
                    <RelatedProductCollections title={t('related-collections')} collections={props?.collections} />
                </Wrapper>
            </ContentContainer>
        </Layout>
    );
};

const MultiDescription: React.FC<{ data: Record<string, React.ReactNode>; defaultOpenKeys?: string[] }> = ({
    data,
    defaultOpenKeys,
}) => {
    const [open, setOpen] = useState<Record<string, boolean>>(
        Object.keys(data).reduce((acc, key) => {
            if (defaultOpenKeys?.includes(key)) return { ...acc, [key]: true };
            return { ...acc, [key]: false };
        }, {}),
    );

    return (
        <Stack column gap="2rem" style={{ marginTop: '3.5rem' }}>
            {Object.entries(data).map(([key, children]) => (
                <GridWrapper key={key} w100 column>
                    <GridTitle onClick={() => setOpen({ ...open, [key]: !open[key] })}>
                        <TP size="1.5rem" weight={400}>
                            {key}
                        </TP>
                        {open[key] ? <MinusIcon size="1.5rem" /> : <PlusIcon size="1.5rem" />}
                    </GridTitle>
                    <Grid open={open[key]}>
                        <GridEntry>{children}</GridEntry>
                    </Grid>
                    <Line />
                </GridWrapper>
            ))}
        </Stack>
    );
};

const Line = styled.div`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.gray(100)};
    margin-top: 2rem;
`;

const GridWrapper = styled(Stack)``;

const Grid = styled.div<{ open: boolean }>`
    display: grid;
    grid-template-rows: ${({ open }) => (open ? '1fr' : '0fr')};
    transition: grid-template-rows 0.3s ease-in-out;
`;

const GridTitle = styled.button`
    width: 100%;
    border: none;
    background-color: transparent;
    padding: 0;
    cursor: pointer;

    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const GridEntry = styled(Stack)`
    overflow: hidden;
`;

const Wrapper = styled(Stack)`
    padding-top: 2rem;
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
