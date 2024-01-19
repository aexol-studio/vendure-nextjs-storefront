import { Stack } from '@/src/components/atoms/Stack';
import { TP, TypoGraphy } from '@/src/components/atoms/TypoGraphy';
import { useTranslation } from 'next-i18next';
import React from 'react';

interface Props {
    state: string;
}

const states = ['Payment', 'Shipped', 'Delivered'];

export const CustomerOrderStatus: React.FC<Props> = ({ state }) => {
    const _state = states.includes(state) ? state : states[0];
    const { t } = useTranslation('customer');
    return (
        <Stack itemsStart>
            {states.map(s =>
                _state.includes(s) ? (
                    <Stack column key={s} gap="0.25rem">
                        <TypoGraphy size="2rem" weight={500}>
                            {t('orderPage.orderStatus')}
                        </TypoGraphy>
                        <TP>{s}</TP>
                    </Stack>
                ) : null,
            )}
        </Stack>
    );
};
