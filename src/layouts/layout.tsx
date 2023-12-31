import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { CustomHelmet } from '@/src/components';
import { Nav } from '@/src/layouts/Nav';
import { CollectionTileType } from '@/src/graphql/selectors';
import { Footer } from '@/src/layouts/Footer';
import { Stack } from '@/src/components/atoms/Stack';
import { useCart } from '@/src/state/cart';
import { CategoryBar } from '@/src/layouts/CategoryBar';
import { thv } from '@/src/theme';
import { useProduct } from '../state/product';
import { useCollection } from '../state/collection';
import { RootNode } from '../util/arrayToTree';

export const siteTitle = 'Aexol Next.js Storefront';

interface LayoutProps {
    pageTitle?: string;
    children: React.ReactNode;
    categories: CollectionTileType[];
    navigation: RootNode<CollectionTileType> | null;
}

interface CheckoutLayoutProps {
    pageTitle?: string;
    children: React.ReactNode;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;
const MainStack = styled(Stack)`
    min-height: 100vh;
    width: 100%;
    background: ${thv.background.main};
`;

export const Layout: React.FC<LayoutProps> = ({ pageTitle, children, categories, navigation }) => {
    const { fetchActiveOrder } = useCart();
    const { product, variant } = useProduct();
    const { collection } = useCollection();
    useEffect(() => {
        fetchActiveOrder();
    }, []);

    return (
        <MainStack column>
            <CustomHelmet
                pageTitle={pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle}
                product={product}
                variant={variant}
                collection={collection}
            />
            <Nav navigation={navigation} />
            {categories?.length > 0 ? <CategoryBar collections={categories} /> : null}
            <Container>{children}</Container>
            <Footer />
        </MainStack>
    );
};

export const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ pageTitle, children }) => {
    return (
        <MainStack column>
            <CustomHelmet pageTitle={pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle} />
            <Container>{children}</Container>
        </MainStack>
    );
};
