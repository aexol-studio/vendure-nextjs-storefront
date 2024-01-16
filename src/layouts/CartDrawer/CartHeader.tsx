import { Stack } from '@/src/components/atoms/Stack';
import { TH2, TP } from '@/src/components/atoms/TypoGraphy';
import { IconButton } from '@/src/components/molecules/Button';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { useCart } from '@/src/state/cart';
import styled from '@emotion/styled';
import { X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

interface Props {
    activeOrder?: ActiveOrderType;
}

export const CartHeader: React.FC<Props> = ({ activeOrder }) => {
    const { t } = useTranslation('common');
    const { close } = useCart();
    return (
        <CartHeaderWrapper justifyBetween itemsCenter>
            <Stack itemsEnd gap="1rem">
                <TH2>{t('your-cart')}</TH2>
                {activeOrder?.totalQuantity ? (
                    <TP style={{ marginBottom: '0.5rem' }}>
                        ({activeOrder?.lines.length} {t('items')})
                    </TP>
                ) : null}
            </Stack>
            <IconButton onClick={close}>
                <X />
            </IconButton>
        </CartHeaderWrapper>
    );
};

const CartHeaderWrapper = styled(Stack)`
    padding: 1.5rem 2rem;
    border-bottom: 1px solid ${p => p.theme.gray(100)};
`;
