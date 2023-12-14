import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { MainGrid } from '@/src/components/atoms/MainGrid';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { FacetFilterCheckbox } from '@/src/components/molecules/FacetFilter';
import { ProductTile } from '@/src/components/molecules/ProductTile';
import { storefrontApiQuery } from '@/src/graphql/client';
import { FacetSelector, ProductSearchSelector, ProductSearchType } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { IconButton } from '@/src/components/molecules/Button';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { MainBar } from '@/src/components/organisms/MainBar';

const SearchPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('common');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [products, setProducts] = useState<ProductSearchType[]>([]);
    const router = useRouter();

    const { collection, q } = router.query;

    useEffect(() => {
        if (q) {
            storefrontApiQuery({
                search: [
                    { input: { groupByProduct: true, collectionSlug: collection as string, term: q as string } },
                    {
                        items: ProductSearchSelector,
                    },
                ],
            }).then(r => setProducts(r.search.items));
        }
    }, [router.query]);

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <AnimatePresence>
                    {filtersOpen && (
                        <Facets
                            onClick={() => setFiltersOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}>
                            <FacetsFilters
                                onClick={e => e.stopPropagation()}
                                initial={{ translateX: '-100%' }}
                                animate={{ translateX: '0%' }}
                                exit={{ translateX: '-100%' }}>
                                <Stack column gap="3rem">
                                    <Stack justifyBetween itemsCenter>
                                        <TP weight={400} upperCase>
                                            {t('filters')}
                                        </TP>
                                        <IconButton onClick={() => setFiltersOpen(false)}>
                                            <X />
                                        </IconButton>
                                    </Stack>
                                    <Stack column>
                                        {props.facets.map(f => (
                                            <FacetFilterCheckbox facet={f} key={f.code} />
                                        ))}
                                    </Stack>
                                </Stack>
                            </FacetsFilters>
                        </Facets>
                    )}
                </AnimatePresence>
                <Stack gap="2rem" column>
                    <MainBar categories={props.collections} title={t('search-results') + ' ' + q} />
                    <MainGrid>
                        {products.map(p => {
                            return <ProductTile collections={props.collections} product={p} key={p.slug} />;
                        })}
                    </MainGrid>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const Facets = styled(motion.div)`
    background: ${p => p.theme.grayAlpha(900, 0.5)};
    position: fixed;
    inset: 0;
    z-index: 1;
`;
const FacetsFilters = styled(motion.div)`
    background: ${p => p.theme.gray(0)};
    position: absolute;
    top: 0;
    bottom: 0;
    padding: 2rem;
    left: 0;
    z-index: 1;
    overflow-y: auto;
`;

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common'])(context);
    const collections = await getCollections();

    const facets = await storefrontApiQuery({
        facets: [
            {},
            {
                items: FacetSelector,
            },
        ],
    });
    const returnedStuff = {
        collections: collections,
        facets: facets.facets.items,
        ...r.props,
    };
    return {
        props: returnedStuff,
        revalidate: 10,
    };
};
export { getStaticProps, getStaticPaths };
export default SearchPage;
