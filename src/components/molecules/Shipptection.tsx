import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { BoxIcon } from 'lucide-react';
import React from 'react';
import { Stack } from '../atoms/Stack';
import { TP } from '../atoms/TypoGraphy';
import { Trans, useTranslation } from 'next-i18next';
import { priceFormatter } from '@/src/util/priceFomatter';
import { CurrencyCode } from '@/src/zeus';

const transition = {
    type: 'spring',
    stiffness: 500,
    damping: 50,
};

export const ShippingProtection: React.FC<{
    value: number;
    active: boolean;
    onClick: (value: boolean) => void;
    currencyCode: CurrencyCode;
}> = ({ value, active, onClick, currencyCode }) => {
    const { t } = useTranslation('common');
    return (
        <Stack itemsCenter justifyBetween>
            <Stack gap="1.75rem" itemsCenter>
                <BoxIcon size={24} />
                <Stack column>
                    <TP size="1.5rem" weight={500}>
                        {t('shipping-protection.title')}
                    </TP>
                    <TP size="1.25rem" weight={400}>
                        <Trans
                            i18nKey="shipping-protection.subtitle"
                            t={t}
                            values={{ value: priceFormatter(value, currencyCode) }}
                            components={{ 1: <span></span> }}
                        />
                    </TP>
                </Stack>
            </Stack>
            <Switch active={active} onClick={() => onClick(!active)}>
                <Toggle layout transition={transition} />
            </Switch>
        </Stack>
    );
};

const Switch = styled.div<{ active: boolean }>`
    width: 4.2rem;
    height: 2.2rem;
    padding: 0.4rem;

    display: flex;
    justify-content: ${p => (p.active ? 'flex-end' : 'flex-start')};
    border-radius: ${p => p.theme.borderRadius};

    border: 1px solid ${p => p.theme.gray(1000)};

    cursor: pointer;
`;

const Toggle = styled(motion.div)`
    width: 1.4rem;
    height: 100%;
    background: ${p => p.theme.gray(1000)};
`;
