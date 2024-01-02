import { storefrontApiMutation } from '@/src/graphql/client';
import { Dropdown, HoverMenu } from '@/src/styles/reusableStyles';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Link, Stack } from '@/src/components/atoms';
import { User2, UserCheck2 } from 'lucide-react';

const routes = [
    { href: '/customer/manage', sub: [''], label: 'navigation.manageAccount' as const },
    { href: '/customer/manage/addresses', sub: [''], label: 'navigation.manageAddresses' as const },
    {
        href: '/customer/manage/orders',
        sub: ['/customer/manage/orders/[code]'],
        label: 'navigation.manageOrders' as const,
    },
];

export const UserMenu: React.FC<{ isLogged: boolean }> = ({ isLogged }) => {
    const { pathname } = useRouter();
    const { t } = useTranslation('common');

    const handleLogout = async () => {
        await storefrontApiMutation({ logout: { success: true } });
        window.location.reload();
    };

    return (
        <Dropdown>
            <IconLink href={isLogged ? '/customer/manage' : '/customer/sign-in'}>
                <AnimatePresence>
                    {isLogged ? (
                        <IconWrapper initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <UserCheck2 size="2.4rem" />
                        </IconWrapper>
                    ) : (
                        <IconWrapper initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <User2 size="2.4rem" />
                        </IconWrapper>
                    )}
                </AnimatePresence>
            </IconLink>
            {isLogged && (
                <HoverMenu customerMenu>
                    <Stack column gap="1rem">
                        {routes.map(route => (
                            <MenuItem key={route.href}>
                                <StyledLink href={route.href}>{t(route.label)}</StyledLink>
                                <UnderLine
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: pathname === route.href || route.sub.includes(pathname) ? '100%' : '0%',
                                    }}
                                    exit={{ width: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </MenuItem>
                        ))}
                        <MenuItem className="button" onClick={handleLogout}>
                            {t('navigation.logout')}
                        </MenuItem>
                    </Stack>
                </HoverMenu>
            )}
        </Dropdown>
    );
};

const IconWrapper = styled(motion.div)`
    width: 2.4rem;
    height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const MenuItem = styled.div`
    color: ${p => p.theme.text.inactive};
    font-size: 1.6rem;
    cursor: pointer;
`;

const UnderLine = styled(motion.s)`
    width: 100%;
    height: 2px;
    background-color: ${p => p.theme.grayAlpha(300, 200)};
`;

const IconLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;

    color: ${p => p.theme.text.main};
`;

const StyledLink = styled(Link)`
    color: ${p => p.theme.text.inactive};

    &:hover {
        transition: 0.3s all ease-in-out;
        color: ${p => p.theme.text.main};
    }
`;
