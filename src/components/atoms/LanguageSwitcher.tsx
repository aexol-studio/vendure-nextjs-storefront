import { Dropdown, HoverMenu } from '@/src/styles/reusableStyles';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import React from 'react';
import languageDetector from '@/src/lib/lngDetector';
import nextI18nextConfig from '@/next-i18next.config';
import { getFlagByCode } from '@/src/util/i18Helpers';
import { Chevron } from '@/src/assets';

const Container = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    width: 40px;

    & > div:first-of-type {
        display: flex;
        align-items: center;

        &:after {
            position: absolute;
            content: '';
            width: 100%;
            bottom: -10px;
            left: 0;
            height: 10px;
        }
    }

    svg {
        width: auto;
        height: 13px;
        cursor: pointer;
    }

    svg:not(.chevron) {
        border: 1px solid none;
    }

    svg.chevron {
        width: 12px;
    }
`;

const CurrentFlag = styled.div`
    height: 26px;
    display: flex;
    align-items: center;

    .chevron.chevron {
        position: static;
        transform: none;
        margin-left: 6px;
        width: 0.8rem;
    }

    @media (max-width: 550px) {
        height: 20px;
    }
`;

const Language = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;

    &.language {
        margin-bottom: 2rem;
    }

    &:hover {
        p {
            color: blue;
        }
    }

    p {
        transition: all 0.3s ease;
        text-transform: capitalize;
        line-height: 1.6rem;
        margin-left: 10px;
        position: relative;
        bottom: 1px;
    }
`;

export const LanguageSwitcher = () => {
    const { query, push, pathname } = useRouter();
    const { locales, defaultLocale } = nextI18nextConfig.i18n;
    const currentLocale = (query.locale as string) || defaultLocale;

    const languages = locales
        .filter(locale => locale !== currentLocale)
        .map(newLang => {
            return (
                <Language
                    key={newLang}
                    className="language"
                    onClick={() => {
                        languageDetector.cache && languageDetector.cache(newLang);
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
            <Dropdown>
                <CurrentFlag id="currentflag">
                    {getFlagByCode(currentLocale, true)}
                    <Chevron />
                </CurrentFlag>
                <HoverMenu langSwitcher>{languages}</HoverMenu>
            </Dropdown>
        </Container>
    );
};
