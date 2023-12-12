import { Link } from '@/src/components/atoms/Link';
import { Stack } from '@/src/components/atoms/Stack';
import { Button } from '@/src/components/molecules/Button';
import { storefrontApiMutation } from '@/src/graphql/client';
import { usePush } from '@/src/lib/redirect';
import React from 'react';

export const CustomerNavigation: React.FC = () => {
    const push = usePush();
    const onClick = async () => {
        await storefrontApiMutation({ logout: { success: true } });
        push('/');
    };
    return (
        <Stack justifyCenter itemsCenter gap="2.5rem">
            <Link href="/customer/manage">Manage Account</Link>
            <Link href="/customer/manage/addresses">Manage Addresses</Link>
            <Link href="/customer/manage/orders">Manage Orders</Link>
            <Button onClick={onClick}>Logout</Button>
        </Stack>
    );
};
