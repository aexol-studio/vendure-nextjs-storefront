import { LogoAexol } from '@/src/assets';
import { ContentContainer, LanguagePicker } from '@/src/components/atoms';
import { UserMenu } from '@/src/components/molecules/UserMenu';

import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { Link } from '@/src/components/atoms/Link';
import { useCart } from '@/src/state/cart';

// import { Cart } from '@/src/layouts/Cart';
// import { LanguageSwitcher } from '@/src/components';

import { CartDrawer } from '@/src/layouts/CartDrawer';
import { CollectionTileType, NavigationType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';
import { DesktopNavigation } from '@/src/components/organisms/DesktopNavigation';
import { SearchIcon } from 'lucide-react';
import { IconButton } from '@/src/components/molecules/Button';
import { AnnouncementBar } from '@/src/components/organisms/AnnouncementBar';
import { CategoryBar } from './CategoryBar';
import { NavigationSearch } from '../components/organisms/NavgationSearch';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface NavigationProps {
    navigation: RootNode<NavigationType> | null;
    categories: CollectionTileType[];
}

export const Navigation: React.FC<NavigationProps> = ({ navigation, categories }) => {
    const { isLogged, cart } = useCart();

    const entries = [
        {
            text: 'Next JS Storefront demo made by Aexol',
            href: 'https://aexol.com',
            bgColor: 'lch(50% 0 0)',
            textColor: 'lch(80% 0 0)',
            hoverTextColor: 'lch(100% 0 0)',
            hoverBgColor: 'lch(50% 0 0)',
        },
        {
            text: 'Best store ever',
            href: '/',
            bgColor: 'lch(50% 0 0)',
            textColor: 'lch(80% 0 0)',
            hoverTextColor: 'lch(100% 0 0)',
            hoverBgColor: 'lch(50% 0 0)',
        },
        {
            text: 'See best products',
            href: '/collections/all',
            bgColor: 'lch(50% 0 0)',
            textColor: 'lch(80% 0 0)',
            hoverTextColor: 'lch(100% 0 0)',
            hoverBgColor: 'lch(50% 0 0)',
        },
    ];
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <>
            <AnnouncementBar entries={entries} secondsBetween={5} />
            <StickyContainer>
                <ContentContainer>
                    <Stack itemsCenter justifyBetween gap="5rem" w100>
                        <Stack itemsCenter>
                            <Link href={'/'}>
                                <LogoAexol />
                            </Link>
                        </Stack>
                        <AnimatePresence>
                            {searchOpen ? (
                                <motion.div
                                    style={{ width: '100%' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}>
                                    <NavigationSearch
                                        searchOpen={searchOpen}
                                        toggleSearch={() => setSearchOpen(p => !p)}
                                    />
                                </motion.div>
                            ) : (
                                <DesktopNavigation navigation={navigation} />
                            )}
                        </AnimatePresence>
                        <Stack gap="1rem" itemsCenter>
                            <IconButton onClick={() => setSearchOpen(p => !p)}>
                                <SearchIcon />
                            </IconButton>
                            <LanguagePicker />
                            <UserMenu isLogged={isLogged} />
                            {/* <Cart activeOrder={cart} /> */}
                            <CartDrawer activeOrder={cart} />
                        </Stack>
                    </Stack>
                </ContentContainer>
            </StickyContainer>
            {categories?.length > 0 ? <CategoryBar collections={categories} /> : null}
        </>
    );
};

const StickyContainer = styled.nav`
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    padding: 2rem;
    position: sticky;
    top: 0;
    background: ${p => p.theme.gray(0)};
    z-index: 2137;
    border-bottom: 1px solid ${p => p.theme.gray(100)};
    svg {
        max-height: 4rem;
    }
`;
