import { Link } from '@/src/components/atoms/Link';
import { Stack } from '@/src/components/atoms/Stack';
import { Button } from '@/src/components/molecules/Button';
import { storefrontApiMutation } from '@/src/graphql/client';
import { usePush } from '@/src/lib/redirect';
import styled from '@emotion/styled';
import React from 'react';

export const CustomerNavigation: React.FC = () => {
    const push = usePush();
    const onClick = async () => {
        await storefrontApiMutation({ logout: { success: true } });
        push('/');
    };
    return (
        <NavigationBox column justifyCenter gap="2.5rem">
            <Stack column gap="1.25rem">
                <Link href="/customer/manage">Manage Account</Link>
                <Link href="/customer/manage/addresses">Manage Addresses</Link>
                <Link href="/customer/manage/orders">Manage Orders</Link>
            </Stack>
            <Button onClick={onClick}>Logout</Button>
        </NavigationBox>
    );
};

const NavigationBox = styled(Stack)`
    min-width: 30rem;
    max-width: 30rem;
    width: 100%;

    padding: 1.25rem 2.75rem;
    border: 1px solid ${p => p.theme.gray(100)};
`;
