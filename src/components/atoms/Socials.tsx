import React from 'react';
import { Stack } from './Stack';
import { Facebook, Github, Instagram, Twitter, Youtube } from 'lucide-react';
import { useTheme } from '@emotion/react';
import { Link } from '@/src/components/atoms/Link';

const socialHrefs = [
    { href: 'https://www.facebook.com/', icon: <Facebook /> },
    { href: 'https://www.twitter.com/', icon: <Twitter /> },
    { href: 'https://www.instagram.com/', icon: <Instagram /> },
    { href: 'https://www.youtube.com/', icon: <Youtube /> },
    { href: 'https://github.com/aexol-studio/vendure-nextjs-storefront', icon: <Github /> },
];

export const Socials = () => {
    const theme = useTheme();
    const mode = 'light';
    return (
        <Stack gap="0.75rem" justifyEnd>
            {socialHrefs.map(({ href, icon }) => (
                <Link
                    external
                    style={{ height: 'max-content', color: mode === 'light' ? theme.gray(800) : theme.gray(200) }}
                    key={href}
                    href={href}>
                    {icon}
                </Link>
            ))}
        </Stack>
    );
};
