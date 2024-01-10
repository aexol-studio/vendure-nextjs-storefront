import React from 'react';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { LogoAexol, LogoAexolDark } from '@/src/assets';
import { Stack } from '@/src/components/atoms/Stack';
import { Link } from '@/src/components/atoms/Link';
import styled from '@emotion/styled';

export const Copy = () => {
    const mode = 'light';
    return (
        <StyledLink external href="https://aexol.com/pl/">
            <Stack itemsCenter gap="0.5rem">
                <MadeBy size="1rem">&copy; 2024 Made by</MadeBy>
                {mode === 'light' ? <LogoAexol height={36} width={36} /> : <LogoAexolDark height={36} width={36} />}
            </Stack>
        </StyledLink>
    );
};

const StyledLink = styled(Link)`
    color: ${({ theme }) => theme.gray(900)};
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

const MadeBy = styled(TP)`
    color: ${({ theme }) => theme.gray(500)};
`;
