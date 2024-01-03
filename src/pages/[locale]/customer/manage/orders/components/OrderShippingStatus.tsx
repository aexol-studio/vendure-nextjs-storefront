import { Stack, TP, Price } from '@/src/components';
import { ShippingLineType } from '@/src/graphql/selectors';
import { CurrencyCode } from '@/src/zeus';
import { PackageCheck } from 'lucide-react';
import React from 'react';

interface OrderShippingStatusProps {
    label: string;
    shipping?: ShippingLineType;
    currencyCode: CurrencyCode;
}

export const OrderShippingStatus: React.FC<OrderShippingStatusProps> = ({ currencyCode, shipping, label }) => {
    if (!shipping) return null;
    return (
        <Stack column gap="0.5rem">
            <Stack gap="0.25rem" itemsCenter>
                <PackageCheck size={'1.6rem'} />
                <TP size="1.25rem" weight={500}>
                    {label}
                </TP>
            </Stack>
            <Stack itemsCenter>
                <Price currencyCode={currencyCode} price={shipping?.priceWithTax} />
                <TP>&nbsp;- {shipping?.shippingMethod.name}</TP>
            </Stack>
        </Stack>
    );
};
