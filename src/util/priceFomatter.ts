import languageDetector from '@/src/lib/lngDetector';
/**
 * @param price - price to format
 */
export function priceFormatter(price: number) {
    //TODO: more universal solution
    const translations = {
        en: {
            country: 'US',
            currency: 'USD',
        },
        de: {
            country: 'DE',
            currency: 'EUR',
        },
        pl: {
            country: 'PL',
            currency: 'PLN',
        },
    };

    let detectedLng = (languageDetector?.detect() || 'en') as keyof typeof translations;
    if (!translations[detectedLng]) detectedLng = 'en';

    const formatterCode = new Intl.NumberFormat(translations[detectedLng].country, {
        style: 'currency',
        currencyDisplay: 'symbol',
        currency: translations[detectedLng].currency,
    });
    return formatterCode.format(price / 100);
}
