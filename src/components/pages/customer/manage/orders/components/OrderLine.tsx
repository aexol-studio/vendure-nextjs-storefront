import { Price } from '@/src/components/atoms/Price';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { CurrencyCode } from '@/src/zeus';

interface Props {
    line: ActiveOrderType['lines'][number];
    currencyCode: CurrencyCode;
}

export const OrderLine: React.FC<Props> = ({ currencyCode, line }) => {
    const { t } = useTranslation('customer');
    const optionInName = line.productVariant.name.replace(line.productVariant.product.name, '') !== '';

    return (
        <Stack gap="2rem" w100 key={line.id}>
            <ProductImage
                size="thumbnail"
                src={line.productVariant.featuredAsset?.source ?? line.featuredAsset?.preview}
                alt={line.productVariant.name}
                title={line.productVariant.name}
            />
            <Stack column>
                <TP size="1.5rem" weight={500} noWrap>
                    {line.productVariant.product.name}
                </TP>
                {optionInName && (
                    <TP size="1.25rem" weight={400} capitalize>
                        {line.productVariant.name.replace(line.productVariant.product.name, '')}
                    </TP>
                )}
                <Price
                    currencyCode={currencyCode}
                    price={line.linePriceWithTax}
                    discountPrice={line.discountedLinePriceWithTax}
                />
                <Stack itemsCenter gap="0.5rem">
                    <TP size="1.25rem" weight={500}>
                        {t('orderPage.quantity')}
                    </TP>
                    <TP size="1.25rem">{line.quantity}</TP>
                </Stack>
            </Stack>
        </Stack>
    );
};
