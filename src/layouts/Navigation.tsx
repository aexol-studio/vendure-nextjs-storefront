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
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationSearch } from '../components/organisms/NavgationSearch/hooks';
import { useEffect, useRef } from 'react';

interface NavigationProps {
    navigation: RootNode<NavigationType> | null;
    categories: CollectionTileType[];
}

// IT SHOULD BE MOVED TO VENDURE AS PLUGIN FOR EXAMPLE
const entries = [
    {
        text: 'NextJS Storefront demo made by Aexol 🚀',
        href: 'https://aexol.com',
        bgColor: 'lch(50% 0 0)',
        textColor: 'lch(80% 0 0)',
        hoverTextColor: 'lch(100% 0 0)',
        hoverBgColor: 'lch(50% 0 0)',
    },
    {
        text: '🔥 BEST STORE EVER 🔥',
        href: 'https://aexol.com',
        bgColor: 'lch(50% 0 0)',
        textColor: 'lch(80% 0 0)',
        hoverTextColor: 'lch(100% 0 0)',
        hoverBgColor: 'lch(50% 0 0)',
    },
    {
        text: 'See best products here 👀',
        href: '/collections/all',
        bgColor: 'lch(50% 0 0)',
        textColor: 'lch(80% 0 0)',
        hoverTextColor: 'lch(100% 0 0)',
        hoverBgColor: 'lch(50% 0 0)',
    },
];

export const Navigation: React.FC<NavigationProps> = ({ navigation, categories }) => {
    const { isLogged, cart } = useCart();
    const navigationSearch = useNavigationSearch();
    const searchRef = useRef<HTMLDivElement>(null);
    const searchMobileRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLButtonElement>(null);

    const handleOutsideClick = (event: MouseEvent) => {
        if (
            searchRef.current &&
            !searchRef.current.contains(event.target as Node) &&
            iconRef.current &&
            !iconRef.current.contains(event.target as Node) &&
            searchMobileRef.current &&
            !searchMobileRef.current.contains(event.target as Node)
        ) {
            navigationSearch.closeSearch();
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

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
                            {navigationSearch.searchOpen ? (
                                <DesktopNavigationContainer
                                    style={{ width: '100%' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    ref={searchRef}>
                                    <NavigationSearch {...navigationSearch} />
                                </DesktopNavigationContainer>
                            ) : (
                                <DesktopNavigation navigation={navigation} />
                            )}
                        </AnimatePresence>
                        <Stack gap="1rem" itemsCenter>
                            <IconButton onClick={navigationSearch.toggleSearch} ref={iconRef}>
                                <SearchIcon />
                            </IconButton>
                            <LanguagePicker />
                            <UserMenu isLogged={isLogged} />
                            <CartDrawer activeOrder={cart} />
                        </Stack>
                    </Stack>
                </ContentContainer>
                {navigationSearch.searchOpen && (
                    <MobileNavigationContainer ref={searchMobileRef}>
                        <NavigationSearch {...navigationSearch} />
                    </MobileNavigationContainer>
                )}
            </StickyContainer>

            {categories?.length > 0 ? <CategoryBar collections={categories} /> : null}
        </>
    );
};

const StickyContainer = styled.nav`
    display: flex;
    flex-direction: column;
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

const MobileNavigationContainer = styled.div`
    display: block;
    padding: 2.5rem 2rem 0 2rem;
    width: 100%;
    @media (min-width: ${p => p.theme.breakpoints.md}) {
        display: none;
    }
`;

const DesktopNavigationContainer = styled(motion.div)`
    display: none;
    @media (min-width: ${p => p.theme.breakpoints.md}) {
        display: block;
    }
`;
