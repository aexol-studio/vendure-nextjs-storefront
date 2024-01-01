import React from 'react';
import { TP, Stack, Link } from '@/src/components/atoms';
import styled from '@emotion/styled';
import { Home } from 'lucide-react';

export const Breadcrumbs: React.FC<{
    breadcrumbs: {
        name: string | undefined;
        href: string;
    }[];
}> = ({ breadcrumbs }) => {
    return (
        <Stack itemsCenter>
            {breadcrumbs.map((b, i) => {
                const isHome = i === 0;
                const last = !!(i === breadcrumbs.length - 1);
                return (
                    <Stack itemsCenter gap="0.5rem" key={b.name}>
                        <StyledLink href={b.href} last={last}>
                            <Stack itemsCenter gap="0.5rem">
                                {isHome && <Home size={16} />}
                                <TP size="1.25rem" weight={last ? 600 : 400}>
                                    {b.name}
                                </TP>
                            </Stack>
                        </StyledLink>
                        {!last && (
                            <TP size="1.25rem" weight={600}>
                                /&nbsp;
                            </TP>
                        )}
                    </Stack>
                );
            })}
        </Stack>
    );
};

const StyledLink = styled(Link)<{ last: boolean }>`
    text-decoration: none;
    pointer-events: ${p => (p.last ? 'none' : 'auto')};
    color: ${p => p.theme.gray(900)};
`;
