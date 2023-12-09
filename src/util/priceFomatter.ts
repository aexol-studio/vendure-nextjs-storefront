import { CurrencyCode } from '@/src/zeus';
/**
 * @param price - price to format
 */
export function priceFormatter(price: number, currencyCode: CurrencyCode) {
    //TODO: more universal solution
    const translations: Partial<Record<CurrencyCode, { country: string }>> = {
        [CurrencyCode.USD]: {
            country: 'US',
        },
        [CurrencyCode.EUR]: {
            country: 'DE',
        },
        [CurrencyCode.PLN]: {
            country: 'PL',
        },
    };
    const c = translations[currencyCode];
    if (!c) {
        const formatterCode = new Intl.NumberFormat('US', {
            style: 'currency',
            currencyDisplay: 'symbol',
            currency: 'USD',
        });
        return formatterCode.format(price / 100);
    }

    const formatterCode = new Intl.NumberFormat(c.country, {
        style: 'currency',
        currencyDisplay: 'symbol',
        currency: currencyCode,
    });
    return formatterCode.format(price / 100);
}
