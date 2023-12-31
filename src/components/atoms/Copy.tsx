import React from 'react';
import { TP } from './TypoGraphy';
import { LogoAexol, LogoAexolDark } from '@/src/assets';
import { Stack } from '@/src/components/atoms/Stack';
import { Link } from '@/src/components/atoms/Link';
import { useTheme } from '@emotion/react';

export const Copy = () => {
    const theme = useTheme();
    const mode = 'light';
    return (
        <Link
            external
            href="https://aexol.com/pl/"
            style={{ color: mode === 'light' ? theme.gray(900) : theme.gray(200) }}>
            <Stack itemsCenter gap="0.5rem">
                <TP size="1rem">&copy; 2023 Made by</TP>
                {mode === 'light' ? <LogoAexol height={36} width={36} /> : <LogoAexolDark height={36} width={36} />}
            </Stack>
        </Link>
    );
};
