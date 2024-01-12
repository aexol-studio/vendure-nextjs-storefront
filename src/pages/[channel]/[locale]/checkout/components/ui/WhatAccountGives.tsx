import { Tooltip } from '@/src/components/molecules/Tooltip';
import { Info } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'next-i18next';

export const WhatAccountGives: React.FC = () => {
    const { t } = useTranslation('checkout');
    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Tooltip text={t('orderForm.whatAccountGives')}>
                <Info size={12} />
            </Tooltip>
        </div>
    );
};
