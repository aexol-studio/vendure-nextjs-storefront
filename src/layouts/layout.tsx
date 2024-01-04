import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { CustomHelmet } from '@/src/components';
import { Navigation } from '@/src/layouts/Navigation';
import { CollectionTileType, NavigationType } from '@/src/graphql/selectors';
import { Footer } from '@/src/layouts/Footer';
import { Stack } from '@/src/components/atoms/Stack';
import { CategoryBar } from '@/src/layouts/CategoryBar';
import { thv } from '@/src/theme';
import { useProduct } from '@/src/state/product';
import { useCollection } from '@/src/state/collection';
import { useCart } from '@/src/state/cart';
import { RootNode } from '@/src/util/arrayToTree';
import { AnnouncementBar } from '../components/organisms/AnnouncementBar';

export const siteTitle = 'Aexol Next.js Storefront';

interface LayoutProps {
    pageTitle?: string;
    children: React.ReactNode;
    categories: CollectionTileType[];
    navigation: RootNode<NavigationType> | null;
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

    //TODO: it should be dynamic as plugin.
    const entries = [
        {
            message: 'Next JS Storefront demo made by Aexol',
            href: 'https://aexol.com',
            bgColor: 'lch(50% 0 0)',
            textColor: 'lch(80% 0 0)',
            hoverTextColor: 'lch(100% 0 0)',
            hoverBgColor: 'lch(50% 0 0)',
        },
        {
            message: 'Best store ever',
            href: '/',
            bgColor: 'lch(50% 0 0)',
            textColor: 'lch(80% 0 0)',
            hoverTextColor: 'lch(100% 0 0)',
            hoverBgColor: 'lch(50% 0 0)',
        },
        {
            message: 'See best products',
            href: '/collections/all',
            bgColor: 'lch(50% 0 0)',
            textColor: 'lch(80% 0 0)',
            hoverTextColor: 'lch(100% 0 0)',
            hoverBgColor: 'lch(50% 0 0)',
        },
    ];

    return (
        <MainStack column>
            <CustomHelmet
                pageTitle={pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle}
                product={product}
                variant={variant}
                collection={collection}
            />
            <AnnouncementBar entries={entries} secondsBetween={5} />
            <Navigation navigation={navigation} />
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
