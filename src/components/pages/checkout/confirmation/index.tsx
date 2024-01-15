import React, { useEffect, useState } from 'react';
import { InferGetServerSidePropsType } from 'next';
import { storefrontApiQuery } from '@/src/graphql/client';
import { OrderSelector, OrderType } from '@/src/graphql/selectors';
import { Layout } from '@/src/layouts';
import { OrderConfirmation } from '../components/OrderConfirmation';
import { usePush } from '@/src/lib/redirect';
import { TP, Stack, ContentContainer } from '@/src/components/atoms';
import { useTranslation } from 'next-i18next';
import { getServerSideProps } from './props';
import { useChannels } from '@/src/state/channels';
import styled from '@emotion/styled';

const MAX_RETRIES = 3;

export const ConfirmationPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const ctx = useChannels();
    const { t } = useTranslation('checkout');
    const [order, setOrder] = useState<OrderType | null>(props.orderByCode);
    const push = usePush();

    useEffect(() => {
        let retries = 0;

        const fetchOrder = async () => {
            try {
                const { orderByCode } = await storefrontApiQuery(ctx)({
                    orderByCode: [{ code: props.code }, OrderSelector],
                });
                if (orderByCode && !orderByCode.active) setOrder(orderByCode);
                else throw new Error('Order not found');
            } catch (error) {
                retries++;
                if (retries <= MAX_RETRIES) setTimeout(fetchOrder, 1000);
                else push('/');
            }
        };

        if (!order && props.code) fetchOrder();
    }, []);

    return (
        <Layout
            categories={props.collections}
            navigation={props.navigation}
            pageTitle={`${t('seoTitles.confirmation')}`}>
            {order ? (
                <Content>
                    <OrderConfirmation code={props.code} order={order} />
                </Content>
            ) : (
                <Content>
                    <Stack w100 justifyCenter itemsCenter>
                        <TP>{t('confirmation.orderNotFound')}</TP>
                    </Stack>
                </Content>
            )}
        </Layout>
    );
};

const Content = styled(ContentContainer)`
    position: relative;
`;
