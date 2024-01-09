import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import languageDetector from '@/src/lib/lngDetector';
import nextI18nextConfig from '@/next-i18next.config';
import { getFlagByCode } from '@/src/util/i18Helpers';
import { Chevron } from '@/src/assets';

export const LanguagePicker = () => {
    const { query, push, pathname } = useRouter();
    const { locales, defaultLocale } = nextI18nextConfig.i18n;
    const currentLocale = (query.locale as string) || defaultLocale;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleOutsideClick = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const languages = locales
        .filter(locale => locale !== currentLocale)
        .map(newLang => {
            return (
                <Language
                    key={newLang}
                    className="language"
                    onClick={() => {
                        languageDetector.cache && languageDetector.cache(newLang);
                        //TODO: think about better solution [locale] [slug] [code]
                        const correctPathname = pathname
                            .replace('[locale]', newLang === 'en' ? '' : newLang)
                            .replace('[slug]', query.slug as string)
                            .replace('[code]', query.code as string);

                        push(correctPathname);
                    }}>
                    {getFlagByCode(newLang)}
                </Language>
            );
        });

    return (
        <Container>
            <Dropdown ref={menuRef}>
                <CurrentFlag onClick={() => setDropdownOpen(!dropdownOpen)} id="currentflag">
                    {getFlagByCode(currentLocale, true)}
                    <Chevron />
                </CurrentFlag>
                <Menu isOpen={dropdownOpen}>{languages}</Menu>
            </Dropdown>
        </Container>
    );
};
const Container = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    margin-left: 0.5rem;
    svg {
        width: auto;
        height: 1.3rem;
        cursor: pointer;
        margin-right: 0.5rem;
    }
`;

const CurrentFlag = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    .chevron {
        width: 1rem;
    }
`;

const Language = styled.div`
    display: flex;
    align-items: center;
    padding: 0.8rem 5rem 0.8rem 2rem;
    gap: 1rem;
    cursor: pointer;

    &:hover {
        background-color: ${({ theme }) => theme.gray(100)};
    }
    transition: all 0.3s ease;
`;

const Menu = styled.div<{ isOpen: boolean }>`
    display: block;
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
    position: absolute;
    z-index: 3;
    background-color: ${({ theme }) => theme.background.main};
    color: ${({ theme }) => theme.text.main};
    transition: all 0.4s ease-in-out;
    width: max-content;
    border-radius: 0.6rem;
    border: 1px solid ${({ theme }) => theme.gray(100)};
    left: 50%;
    top: 2.2rem;
    transform: translate(-60%, 1rem);
    overflow: hidden;

    p {
        font-size: 1.5rem;
    }
`;

export const Dropdown = styled.div`
    position: relative;
`;
