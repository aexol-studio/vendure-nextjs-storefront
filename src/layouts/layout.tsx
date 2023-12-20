import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { CustomHelmet } from '@/src/components';
import { Nav } from '@/src/layouts/Nav';
import { ActiveOrderType, CollectionTileType } from '@/src/graphql/selectors';
import { Footer } from '@/src/layouts/Footer';
import { Stack } from '@/src/components/atoms/Stack';
import { useCart } from '@/src/state/cart';
import { CategoryBar } from '@/src/layouts/CategoryBar';
import { thv } from '@/src/theme';
import { CheckoutProvider } from '../state/checkout';

export const siteTitle = 'Next.js Sample Website';

interface LayoutProps {
    pageTitle?: string;
    children: React.ReactNode;
    categories: CollectionTileType[];
}

interface CheckoutLayoutProps {
    initialActiveOrder: ActiveOrderType;
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

export const Layout: React.FC<LayoutProps> = ({ pageTitle, children, categories }) => {
    const { fetchActiveOrder } = useCart();
    useEffect(() => {
        fetchActiveOrder();
    }, []);

    return (
        <MainStack column>
            <CustomHelmet pageTitle={pageTitle ? pageTitle : undefined} />
            <Nav />
            {categories?.length > 0 ? <CategoryBar collections={categories} /> : null}
            <Container>{children}</Container>
            <Footer />
        </MainStack>
    );
};

export const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ pageTitle, children, initialActiveOrder }) => {
    return (
        <CheckoutProvider initialState={{ initialActiveOrder }}>
            <MainStack column>
                <CustomHelmet pageTitle={pageTitle ? pageTitle : undefined} />
                <Container>{children}</Container>
            </MainStack>
        </CheckoutProvider>
    );
};
