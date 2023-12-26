import { Link } from '@/src/components/atoms/Link';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { storefrontApiMutation } from '@/src/graphql/client';
import { usePush } from '@/src/lib/redirect';
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
    const { t } = useTranslation('customer');
    const { pathname } = useRouter();
    const push = usePush();
    const onClick = async () => {
        await storefrontApiMutation({ logout: { success: true } });
        push('/');
    };

    return (
        <NavigationBox w100 column justifyCenter gap="2.5rem">
            <Stack column gap="2rem">
                {routes.map(route => (
                    <Stack key={route.href} column gap="0.25rem">
                        <StyledLink href={route.href}>{t(route.label)}</StyledLink>
                        <UnderLine
                            initial={{ width: 0 }}
                            animate={{ width: pathname === route.href || route.sub.includes(pathname) ? '100%' : '0%' }}
                            exit={{ width: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                    </Stack>
                ))}
            </Stack>
            <Button onClick={onClick}>
                <TP>{t('navigation.logout')}</TP>
            </Button>
        </NavigationBox>
    );
};

const StyledLink = styled(Link)`
    color: ${p => p.theme.text.main};
`;

const UnderLine = styled(motion.div)`
    width: 100%;
    height: 2px;
    background-color: ${p => p.theme.grayAlpha(300, 200)};
`;

const NavigationBox = styled(Stack)`
    margin-top: 2rem;

    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
        max-width: 30rem;
        margin-top: 0;
    }

    padding: 4rem 2.75rem;
    border: 1px solid ${p => p.theme.gray(100)};
`;
