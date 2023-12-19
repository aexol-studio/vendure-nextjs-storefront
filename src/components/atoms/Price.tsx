import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';

interface PriceProps {
    price: number;
    beforePrice?: number | null;
    discountPrice?: number | null;

    currencyCode: CurrencyCode;
    quantity?: number;
}

//TODO: Get care of the styling (tax price, before price, etc... include taxes or not)
// interface PriceProps {
//     price: {
//         withTax: number;
//         withoutTax: number;
//     };
//     beforePrice?: number | null; // if needed can be tax can be calculated (it comes from customFields)
//     discountPrice?: {
//         withTax: number;
//         withoutTax: number;
//     } | null;
//
//     display: "withTax" | "withoutTax" | "both";
//     currencyCode: CurrencyCode;
//     quantity?: number;
// }

export const Price: React.FC<PriceProps> = ({ price, beforePrice, currencyCode, quantity = 1 }) => {
    return (
        <Stack>
            <TP style={{ color: beforePrice ? 'red' : 'black' }}>{priceFormatter(quantity * price, currencyCode)}</TP>
            {beforePrice && (
                <TP style={{ textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                    {priceFormatter(quantity * beforePrice, currencyCode)}
                </TP>
            )}
        </Stack>
    );
};
