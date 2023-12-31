import { storefrontApiMutation } from '@/src/graphql/client';
import { usePush } from '@/src/lib/redirect';
import { Dropdown, HoverMenu } from '@/src/styles/reusableStyles';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Link } from '@/src/components/atoms';
import { User2 } from 'lucide-react';

const routes = [
    { href: '/customer/manage', sub: [''], label: 'navigation.manageAccount' as const },
    { href: '/customer/manage/addresses', sub: [''], label: 'navigation.manageAddresses' as const },
    {
        href: '/customer/manage/orders',
        sub: ['/customer/manage/orders/[code]'],
        label: 'navigation.manageOrders' as const,
    },
];

export const UserMenu: React.FC = () => {
    const { pathname } = useRouter();
    const { t } = useTranslation('common');
    const push = usePush();
    const handleLogout = async () => {
        await storefrontApiMutation({ logout: { success: true } });
        push('/');
    };

    return (
        <Dropdown style={{ width: '2.4rem', height: '2.4rem' }}>
            <StyledLink href="/customer/manage" isLogged>
                <User2 size="2.4rem" color="black" />
            </StyledLink>
            <HoverMenu customerMenu>
                {routes.map(route => (
                    <MenuItem key={route.href}>
                        <StyledLink href={route.href}>{t(route.label)}</StyledLink>
                        <UnderLine
                            initial={{ width: 0 }}
                            animate={{ width: pathname === route.href || route.sub.includes(pathname) ? '100%' : '0%' }}
                            exit={{ width: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                    </MenuItem>
                ))}
                <MenuItem className="button" onClick={handleLogout}>
                    {t('navigation.logout')}
                </MenuItem>
            </HoverMenu>
        </Dropdown>
    );
};

const MenuItem = styled.div`
    color: ${p => p.theme.text.inactive};
    font-size: 1.6rem;
    cursor: pointer;
    margin-bottom: 1.2rem;

    &:hover {
        transition: 0.3s all ease-in-out;
        color: ${p => p.theme.text.main};
    }
`;

const UnderLine = styled(motion.s)`
    width: 100%;
    height: 2px;
    background-color: ${p => p.theme.grayAlpha(300, 200)};
`;

const StyledLink = styled(Link)<{ isLogged?: boolean }>`
    color: ${p => (p.isLogged ? p.theme.text.main : p.theme.text.inactive)};

    &:hover {
        transition: 0.3s all ease-in-out;
        color: ${p => p.theme.text.main};
    }
`;
