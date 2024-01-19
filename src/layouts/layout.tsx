import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { CustomHelmet } from '@/src/components';
import { Navigation } from '@/src/layouts/Navigation';
import { CollectionTileType, NavigationType } from '@/src/graphql/selectors';
import { Footer } from '@/src/layouts/Footer';
import { Stack } from '@/src/components/atoms/Stack';
import { useProduct } from '@/src/state/product';
import { useCollection } from '@/src/state/collection';
import { useCart } from '@/src/state/cart';
import { RootNode } from '@/src/util/arrayToTree';
import { useChannels } from '@/src/state/channels';
import { channels } from '@/src/lib/consts';

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

const MainStack = styled.main`
    min-height: 100vh;
    width: 100%;
    background: ${p => p.theme.background.main};
`;

export const Layout: React.FC<LayoutProps> = ({ pageTitle, children, categories, navigation }) => {
    const { fetchActiveOrder } = useCart();
    const { product, variant } = useProduct();
    const { collection } = useCollection();
    const { channel } = useChannels();

    const [changeModal, setChangeModal] = useState<
        { modal: boolean; channel: string; locale: string; country_name: string } | undefined
    >(undefined);

    useEffect(() => {
        fetchActiveOrder();
        const getCountry = async () => {
            if (channels.length === 1) return;
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                const channelSlug = channels.find(c => c.slug === data.country_code.toLowerCase());
                if (!channelSlug) return;
                if (channelSlug?.channel === channel) return;
                const locale = channels.find(c => c.channel === channelSlug?.channel)?.nationalLocale;
                if (!locale) return;
                setChangeModal({
                    modal: true,
                    channel: channelSlug?.slug,
                    locale,
                    country_name: data.country_name,
                });
            } catch (error) {
                console.log(error);
            }
        };
        getCountry();
    }, []);

    return (
        <MainStack>
            <CustomHelmet
                pageTitle={pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle}
                product={product}
                variant={variant}
                collection={collection}
            />
            <Navigation changeModal={changeModal} navigation={navigation} categories={categories} />
            <Stack w100 itemsCenter column>
                {children}
            </Stack>
            <Footer navigation={navigation} />
        </MainStack>
    );
};

export const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ pageTitle, children }) => {
    return (
        <MainStack>
            <CustomHelmet pageTitle={pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle} />
            <Stack w100 itemsCenter column>
                {children}
            </Stack>
        </MainStack>
    );
};
