import { LogoAexol } from '@/src/assets';
import { ContentContainer } from '@/src/components/atoms';
import { UserMenu } from '@/src/components/molecules/UserMenu';

import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
// import { LanguageSwitcher } from '@/src/components';
import { Link } from '@/src/components/atoms/Link';
import { useCart } from '@/src/state/cart';

// import { Cart } from '@/src/layouts/Cart';
import { CartDrawer } from '@/src/layouts/CartDrawer';
import { NavigationType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';
import { DesktopNavigation } from '@/src/components/organisms/DesktopNavigation';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '../components/molecules/Button';
import { LanguagePicker } from '@/src/components';

interface NavigationProps {
    navigation: RootNode<NavigationType> | null;
}

export const Navigation: React.FC<NavigationProps> = ({ navigation }) => {
    const { isLogged, cart } = useCart();

    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <Main justifyCenter>
            <ContentContainer>
                <Stack itemsCenter justifyBetween>
                    <Stack itemsCenter>
                        <Link href={'/'}>
                            <LogoAexol />
                        </Link>
                    </Stack>
                    {searchOpen ? (
                        <></>
                    ) : (
                        <>
                            <DesktopNavigation navigation={navigation} />
                            <Stack gap="1rem" itemsCenter>
                                <IconButton onClick={() => setSearchOpen(p => !p)}>
                                    <SearchIcon />
                                </IconButton>
                                {/* <LanguageSwitcher /> */}
                                <UserMenu isLogged={isLogged} />
                                {/* <Cart activeOrder={cart} /> */}
                                <CartDrawer activeOrder={cart} />
                                <LanguagePicker />
                            </Stack>
                        </>
                    )}
                </Stack>
            </ContentContainer>
        </Main>
    );
};

const Main = styled(Stack)`
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
