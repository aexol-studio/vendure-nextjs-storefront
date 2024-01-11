import React from 'react';
import { Stack } from './Stack';
import { Facebook, Github, Instagram, Twitter, Youtube } from 'lucide-react';

import { Link } from '@/src/components/atoms/Link';
import styled from '@emotion/styled';

const socialHrefs = [
    { href: 'https://www.facebook.com/', icon: <Facebook size="2rem" />, ariaLabel: 'Facebook' },
    { href: 'https://www.twitter.com/', icon: <Twitter size="2rem" />, ariaLabel: 'Twitter' },
    { href: 'https://www.instagram.com/', icon: <Instagram size="2rem" />, ariaLabel: 'Instagram' },
    { href: 'https://www.youtube.com/', icon: <Youtube size="2rem" />, ariaLabel: 'Youtube' },
    {
        href: 'https://github.com/aexol-studio/vendure-nextjs-storefront',
        icon: <Github size="2rem" />,
        ariaLabel: 'Github',
    },
];

export const Socials = () => {
    const mode = 'light';
    return (
        <Container gap="0.75rem" justifyEnd mode={mode}>
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
`;
