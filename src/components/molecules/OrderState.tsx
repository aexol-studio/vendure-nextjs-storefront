import React from 'react';
import { useTranslation } from 'next-i18next';
import { orderStateToIcon } from '@/src/util/orderStateToIcon';
import { OrderStateType } from '@/src/graphql/selectors';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import styled from '@emotion/styled';

interface Props {
    state: string;
    size?: 'small' | 'medium' | 'large';
}

export const OrderState: React.FC<Props> = ({ state, size = 'small' }) => {
    const { t } = useTranslation('common');
    const iconSize = size === 'small' ? 20 : size === 'medium' ? 30 : 40;
    return (
        <Stack itemsCenter gap="0.5rem">
            <Stack justifyCenter itemsCenter>
                {orderStateToIcon(state, iconSize)}
            </Stack>
            <StyledTP v={size} weight={500}>
                {t(`orderStates.${state as OrderStateType}`)}
            </StyledTP>
        </Stack>
    );
};

const StyledTP = styled(TP)<{ v: Props['size'] }>`
    font-size: ${p => (p.v === 'small' ? '1.25rem' : p.v === 'medium' ? '1.5rem' : '2rem')};
    font-weight: 500;
`;
