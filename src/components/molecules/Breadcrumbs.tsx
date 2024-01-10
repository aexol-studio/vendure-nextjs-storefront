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
                const isLast = i === breadcrumbs.length - 1;
                return (
                    <Stack itemsCenter gap="0.5rem" key={b.name}>
                        <StyledLink href={b.href} blocked={isLast ? 1 : 0}>
                            <Stack itemsCenter gap="0.5rem">
                                {isHome && <Home size={16} />}
                                <TP size="1.25rem" weight={isLast ? 600 : 400}>
                                    {b.name}
                                </TP>
                            </Stack>
                        </StyledLink>
                        {!isLast && (
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

const StyledLink = styled(Link)<{ blocked?: number }>`
    text-decoration: none;
    pointer-events: ${p => (p.blocked === 1 ? 'none' : 'auto')};
    color: ${p => p.theme.gray(900)};
`;
