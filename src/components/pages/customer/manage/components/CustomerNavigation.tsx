import { Link } from '@/src/components/atoms/Link';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { storefrontApiMutation } from '@/src/graphql/client';
import { usePush } from '@/src/lib/redirect';
import { useChannels } from '@/src/state/channels';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';

const routes = [
    { href: '/customer/manage', sub: [''], label: 'navigation.manageAccount' as const },
    { href: '/customer/manage/addresses', sub: [''], label: 'navigation.manageAddresses' as const },
    {
        href: '/customer/manage/orders',
        sub: ['/customer/manage/orders/[code]'],
        label: 'navigation.manageOrders' as const,
    },
];

export const CustomerNavigation: React.FC = () => {
    const ctx = useChannels();
    const { t } = useTranslation('customer');
    const { pathname } = useRouter();
    const push = usePush();
    const onClick = async () => {
        await storefrontApiMutation(ctx)({ logout: { success: true } });
        push('/');
    };

    const pathnameWithoutChannel = pathname.replace('/[channel]', '');

    return (
        <NavigationBox w100>
            <Stack>
                {routes.map(route => (
                    <Stack column key={route.href}>
                        <MenuItem href={route.href}>
                            <TP>{t(route.label)}</TP>
                            <UnderLine
                                initial={{ width: 0 }}
                                animate={{
                                    width:
                                        pathnameWithoutChannel === route.href ||
                                        route.sub.includes(pathnameWithoutChannel)
                                            ? '100%'
                                            : '0%',
                                }}
                                exit={{ width: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        </MenuItem>
                    </Stack>
                ))}
                <Button onClick={onClick}>
                    <TP upperCase color="contrast">
                        {t('navigation.logout')}
                    </TP>
                </Button>
            </Stack>
        </NavigationBox>
    );
};

const UnderLine = styled(motion.div)`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${p => p.theme.button.back};
`;

const NavigationBox = styled(Stack)`
    width: fit-content;
    margin-top: 2rem;
    display: flex;
    align-items: center;
    text-transform: uppercase;

    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
        margin-top: 0;
    }
`;

const MenuItem = styled(Link)`
    position: relative;
    border: 1px solid ${p => p.theme.gray(100)};
    padding: 1.6rem 2.4rem;
    height: 100%;
    &:hover {
        & > p {
            opacity: 0.7;
        }
    }
    transition: opacity 0.3s ease-in;
`;
