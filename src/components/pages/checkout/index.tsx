import { CheckoutLayout } from '@/src/layouts';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { OrderForm } from './components/OrderForm';
import { useTranslation } from 'next-i18next';
import { getServerSideProps } from './props';
import { CheckoutCarousel } from './components/OrderSummary/CheckoutCarousel';
import { Content, Main } from './components/ui/shared';

export const CheckoutPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('checkout');
    const { availableCountries, alsoBoughtProducts, eligibleShippingMethods, activeCustomer } = props;

    return (
        <CheckoutLayout pageTitle={`${t('seoTitles.checkout')}`}>
            <Content>
                <Main w100 justifyBetween>
                    <OrderForm
                        availableCountries={availableCountries}
                        shippingMethods={eligibleShippingMethods}
                        activeCustomer={activeCustomer}
                    />
                </Main>
                <CheckoutCarousel alsoBoughtProducts={alsoBoughtProducts} />
            </Content>
        </CheckoutLayout>
    );
};
