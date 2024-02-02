import React from 'react';
import { Stack } from './Stack';
import { Facebook, Github, Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from '@/src/components/atoms';
import styled from '@emotion/styled';

const socialHrefs = [
    { href: 'https://www.facebook.com/Aexol', icon: <Facebook size="3rem" />, ariaLabel: 'Facebook' },
    { href: 'https://twitter.com/aexol', icon: <Twitter size="3rem" />, ariaLabel: 'Twitter' },
    { href: 'https://www.instagram.com/aexolofficial/', icon: <Instagram size="3rem" />, ariaLabel: 'Instagram' },
    { href: 'https://www.youtube.com/@AEXOLAPPS', icon: <Youtube size="3rem" />, ariaLabel: 'Youtube' },
    {
        href: 'https://github.com/aexol-studio/vendure-nextjs-storefront',
        icon: <Github size="3rem" />,
        ariaLabel: 'Github',
    },
];

export const Socials: React.FC = () => {
    return (
        <Container gap="1rem" justifyEnd>
            {socialHrefs.map(({ href, icon, ariaLabel }) => (
                <StyledLink aria-label={ariaLabel} external key={href} href={href}>
                    {icon}
                </StyledLink>
            ))}
        </Container>
    );
};

const StyledLink = styled(Link)`
    height: max-content;
    color: inherit;
`;

const Container = styled(Stack)`
    color: ${({ theme }) => theme.gray(800)};
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        gap: 3.5rem;
    }
`;
