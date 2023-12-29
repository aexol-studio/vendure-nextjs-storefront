import { LogoAexol } from '@/src/assets';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { LanguageSwitcher } from '@/src/components';
import { Link } from '@/src/components/atoms/Link';
import { useCart } from '@/src/state/cart';
import { User2 } from 'lucide-react';

// import { Cart } from '@/src/layouts/Cart';
import { CartDrawer } from '@/src/layouts/CartDrawer';
import { Dropdown, HoverMenu } from '../styles/reusableStyles';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { storefrontApiMutation } from '../graphql/client';
import { usePush } from '../lib/redirect';

const routes = [
    { href: '/customer/manage', sub: [''], label: 'navigation.manageAccount' as const },
    { href: '/customer/manage/addresses', sub: [''], label: 'navigation.manageAddresses' as const },
    {
        href: '/customer/manage/orders',
        sub: ['/customer/manage/orders/[code]'],
        label: 'navigation.manageOrders' as const,
    },
];

export const Nav: React.FC = () => {
    const { isLogged, cart } = useCart();
    const { pathname } = useRouter();
    const { t } = useTranslation('customer');
    const push = usePush();

    const userMenu = routes.map(route => (
        <MenuItem key={route.href}>
            <StyledLink href={route.href}>{t(route.label)}</StyledLink>
            <UnderLine
                initial={{ width: 0 }}
                animate={{ width: pathname === route.href || route.sub.includes(pathname) ? '100%' : '0%' }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3 }}
            />
        </MenuItem>
    ));

    const handleLogout = async () => {
        await storefrontApiMutation({ logout: { success: true } });
        push('/');
    };

    return (
        <Main justifyCenter>
            <ContentContainer>
                <Stack itemsCenter justifyBetween>
                    <Stack itemsCenter>
                        <Link href={'/'}>
                            <LogoAexol />
                        </Link>
                    </Stack>
                    <LanguageSwitcher />
                    <Stack gap="1rem">
                        {isLogged ? (
                            <Dropdown>
                                <StyledLink href="/customer/manage">
                                    <User2 size="2.4rem" color="black" />
                                </StyledLink>
                                <HoverMenu customerMenu>
                                    {userMenu}
                                    <MenuItem className="button" onClick={handleLogout}>
                                        {t('navigation.logout')}
                                    </MenuItem>
                                </HoverMenu>
                            </Dropdown>
                        ) : (
                            <StyledLink href="/customer/sign-in">
                                <User2 size="2.4rem" />
                            </StyledLink>
                        )}
                        {/* <Cart activeOrder={cart} /> */}
                        <CartDrawer activeOrder={cart} />
                    </Stack>
                </Stack>
            </ContentContainer>
        </Main>
    );
};
const StyledLink = styled(Link)`
    color: white;

    &:hover {
        transition: 0.3s all ease-in-out;
        color: black;
    }
`;

const MenuItem = styled.div`
    color: white;
    font-size: 1.6rem;
    cursor: pointer;
    margin-bottom: 1.2rem;

    &:hover {
        transition: 0.3s all ease-in-out;
        color: black;
    }
`;

const Main = styled(Stack)`
    width: 100%;
    padding: 2rem;
    position: sticky;
    top: 0;
    background: ${p => p.theme.gray(0)};
    z-index: 1;
    border-bottom: 1px solid ${p => p.theme.gray(100)};
    svg {
        max-height: 4rem;
    }
`;

const UnderLine = styled(motion.s)`
    width: 100%;
    height: 2px;
    background-color: ${p => p.theme.grayAlpha(300, 200)};
`;
