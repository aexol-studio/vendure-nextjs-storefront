import React, { useEffect } from 'react';
import { InferGetServerSidePropsType } from 'next';
import { OrderSummary } from '../components/OrderSummary';
import { OrderPayment } from '../components/OrderPayment';
import { CheckoutLayout } from '@/src/layouts';
import { useTranslation } from 'next-i18next';
import { getServerSideProps } from './props';
import styled from '@emotion/styled';
import { ContentContainer, Stack } from '@/src/components/atoms';

export const PaymentPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('checkout');
    useEffect(() => {
        window.onpopstate = () => window.history.forward();
    }, []);

    return (
        <CheckoutLayout pageTitle={`${t('seoTitles.payment')}`}>
            <Content>
                <Wrapper justifyBetween>
                    <OrderPayment
                        availablePaymentMethods={props.eligiblePaymentMethods}
                        stripeData={props.stripeData}
                    />
                    <OrderSummary />
                </Wrapper>
            </Content>
        </CheckoutLayout>
    );
};

const Wrapper = styled(Stack)`
    margin-top: 1.5rem;
    flex-direction: column-reverse;
    gap: 5rem;
    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
        gap: 10rem;
        flex-direction: row;
    }
`;

const Content = styled(ContentContainer)`
    position: relative;
    width: 1280px;
    padding: 0;

    @media (max-width: 1560px) {
        width: 1440px;
        padding: 0 4rem;
    }
`;
