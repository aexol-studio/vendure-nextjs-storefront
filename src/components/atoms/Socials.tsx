import React from 'react';
import { Stack } from './Stack';
import { Facebook, Github, Instagram, Twitter, Youtube } from 'lucide-react';

import { Link } from '@/src/components/atoms/Link';
import styled from '@emotion/styled';

const socialHrefs = [
    { href: 'https://www.facebook.com/', icon: <Facebook size="3rem" />, ariaLabel: 'Facebook' },
    { href: 'https://www.twitter.com/', icon: <Twitter size="3rem" />, ariaLabel: 'Twitter' },
    { href: 'https://www.instagram.com/', icon: <Instagram size="3rem" />, ariaLabel: 'Instagram' },
    { href: 'https://www.youtube.com/', icon: <Youtube size="3rem" />, ariaLabel: 'Youtube' },
    {
        href: 'https://github.com/aexol-studio/vendure-nextjs-storefront',
        icon: <Github size="3rem" />,
        ariaLabel: 'Github',
    },
];

export const Socials = () => {
    const mode = 'light';
    return (
        <Container gap="1rem" justifyEnd mode={mode}>
            {socialHrefs.map(({ href, icon, ariaLabel }) => (
                <Link
                    aria-label={ariaLabel}
                    external
                    style={{ height: 'max-content', color: 'inherit' }}
                    key={href}
                    href={href}>
                    {icon}
                </Link>
            ))}
        </Container>
    );
};

const Container = styled(Stack)<{ mode?: string }>`
    color: ${({ theme, mode }) => (mode === 'light' ? theme.gray(800) : theme.gray(200))};
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        gap: 3.5rem;
    }
`;
