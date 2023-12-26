import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';
import styled from '@emotion/styled';

interface PriceProps {
    price: number;
    currencyCode: CurrencyCode;
    discountPrice?: number | null;
    quantity?: number;
}

export const Price: React.FC<PriceProps> = ({ price, discountPrice, currencyCode, quantity = 1 }) => {
    const differentPrices = !!(discountPrice && price * quantity !== discountPrice * quantity);
    return (
        <Stack gap="0.75rem">
            <StyledPrice discount={differentPrices}>{priceFormatter(price * quantity, currencyCode)}</StyledPrice>
            {differentPrices && (
                <StyledDiscountPrice>{priceFormatter(discountPrice * quantity, currencyCode)}</StyledDiscountPrice>
            )}
        </Stack>
    );
};

const StyledPrice = styled(TP)<{ discount?: boolean }>`
    color: ${p => p.theme.text.main};
    ${p => (p.discount ? `text-decoration: line-through;` : '')}
`;

const StyledDiscountPrice = styled(TP)`
    //TODO: Add color to theme
    color: red;
`;
