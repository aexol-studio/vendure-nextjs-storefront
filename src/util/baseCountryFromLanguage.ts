//TODO: more universal solution

export const baseCountryFromLanguage = (language: string) => {
    switch (language) {
        case 'en':
            return 'US';
        case 'de':
            return 'DE';
        case 'pl':
            return 'PL';
        default:
            return 'US';
    }
};
