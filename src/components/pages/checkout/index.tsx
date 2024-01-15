import { CheckoutLayout } from '@/src/layouts';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { OrderForm } from './components/OrderForm';
import { useTranslation } from 'next-i18next';
import { getServerSideProps } from './props';
import { CheckoutCarousel } from './components/OrderSummary/CheckoutCarousel';
import styled from '@emotion/styled';
import { ContentContainer } from '@/src/components/atoms';

export const CheckoutPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('checkout');
    const { availableCountries, alsoBoughtProducts, eligibleShippingMethods, activeCustomer } = props;

    return (
        <CheckoutLayout pageTitle={`${t('seoTitles.checkout')}`}>
            <Content>
                <OrderForm
                    availableCountries={availableCountries}
                    shippingMethods={eligibleShippingMethods}
                    activeCustomer={activeCustomer}
                />
                <CheckoutCarousel alsoBoughtProducts={alsoBoughtProducts} />
            </Content>
        </CheckoutLayout>
    );
};

const Content = styled(ContentContainer)`
    position: relative;
    width: 1280px;
    padding: 0;

    @media (max-width: 1560px) {
        width: 1440px;
        padding: 0 4rem;
    }
`;
