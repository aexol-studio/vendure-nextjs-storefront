import React, { useEffect } from 'react';
import { InferGetServerSidePropsType } from 'next';
import { OrderSummary } from '../components/OrderSummary';
import { OrderPayment } from '../components/OrderPayment';
import { Content, Main } from '../components/ui/Shared';
import { CheckoutLayout } from '@/src/layouts';
import { useTranslation } from 'next-i18next';
import { getServerSideProps } from './props';

export const PaymentPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('checkout');
    useEffect(() => {
        window.onpopstate = () => window.history.forward();
    }, []);

    return (
        <CheckoutLayout pageTitle={`${t('seoTitles.payment')}`}>
            <Content>
                <Main>
                    <OrderPayment
                        availablePaymentMethods={props.eligiblePaymentMethods}
                        stripeData={props.stripeData}
                    />
                    <OrderSummary />
                </Main>
            </Content>
        </CheckoutLayout>
    );
};
