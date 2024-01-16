import { US, PL, FR, DE, ES, JP, NL, DK, CZ } from 'country-flag-icons/react/3x2';
import React from 'react';

export const getFlagByCode = (langCode: string | undefined, isCurrent?: boolean) => {
    switch (langCode) {
        case 'pl':
            return (
                <>
                    <PL className="no-default-fill" />
                    {!isCurrent && <p>Polski</p>}
                </>
            );
        case 'de':
            return (
                <>
                    <DE className="no-default-fill" />
                    {!isCurrent && <p>Deutsch</p>}
                </>
            );
        case 'es':
            return (
                <>
                    <ES className="no-default-fill" />
                    {!isCurrent && <p>Español</p>}
                </>
            );
        case 'ja':
            return (
                <>
                    <JP className="no-default-fill" />
                    {!isCurrent && <p>日本</p>}
                </>
            );
        case 'fr':
            return (
                <>
                    <FR className="no-default-fill" />
                    {!isCurrent && <p>Français</p>}
                </>
            );
        case 'en':
        default:
            return (
                <>
                    <US className="no-default-fill" />
                    {!isCurrent && <p>English</p>}
                </>
            );
        case 'nl':
            return (
                <>
                    <NL className="no-default-fill" />
                    {!isCurrent && <p>Nederlands</p>}
                </>
            );
        case 'da':
            return (
                <>
                    <DK className="no-default-fill" />
                    {!isCurrent && <p>Dansk</p>}
                </>
            );
        case 'cz':
            return (
                <>
                    <CZ className="no-default-fill" />
                    {!isCurrent && <p>Czech</p>}
                </>
            );
    }
};
