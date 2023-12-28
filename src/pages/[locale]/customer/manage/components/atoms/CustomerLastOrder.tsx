import { Link } from '@/src/components/atoms/Link';
import { Price } from '@/src/components/atoms/Price';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Button } from '@/src/components/molecules/Button';
import { OrderState } from '@/src/components/molecules/OrderState';
import { ActiveOrderType } from '@/src/graphql/selectors';
import { dateFormatter } from '@/src/util/dateFormatter';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';
import React from 'react';

export const CustomerLastOrder: React.FC<{ order?: ActiveOrderType }> = ({ order }) => {
    const { t } = useTranslation('customer');
    return order ? (
        <LastOrderWrap w100 justifyBetween column gap="1.25rem">
            <TP size="1.75rem" weight={600}>
                {t('accountPage.lastOrder.title')}
            </TP>
            <Stack gap="1.5rem">
                <ProductImage size="thumbnail-big" src={order?.lines[0]?.featuredAsset?.preview} />
                <Stack column gap="0.5rem">
                    <Stack column>
                        <TP size="1.5rem" weight={500}>
                            {t('accountPage.lastOrder.orderNumber')}:&nbsp;
                        </TP>
                        <TP>{order.code}</TP>
                    </Stack>
                    <OrderState state={order.state} />
                    <Stack>
                        <TP size="1.5rem" weight={500}>
                            {t('accountPage.lastOrder.orderDate')}:&nbsp;
                        </TP>
                        <TP>{dateFormatter(order.createdAt, 'date')}</TP>
                    </Stack>
                    <Stack>
                        <TP size="1.5rem" weight={500}>
                            {t('accountPage.lastOrder.totalQuantity')}:&nbsp;
                        </TP>
                        <TP>{order?.totalQuantity}</TP>
                    </Stack>
                    <Stack>
                        <TP size="1.5rem" weight={500}>
                            {t('accountPage.lastOrder.totalProducts')}:&nbsp;
                        </TP>
                        <TP>{order?.lines.length}</TP>
                    </Stack>
                    <Stack>
                        <TP size="1.5rem" weight={500}>
                            {t('accountPage.lastOrder.totalPrice')}:&nbsp;
                        </TP>
                        <Price currencyCode={order?.currencyCode} price={order?.totalWithTax} />
                    </Stack>
                </Stack>
            </Stack>
            <StyledLink href={`/customer/manage/orders/${order?.code}`}>
                <StyledButton style={{ width: '100%' }}>{t('accountPage.lastOrder.viewOrder')}</StyledButton>
            </StyledLink>
        </LastOrderWrap>
    ) : (
        <Stack>
            <TP size="1.75rem" weight={600}>
                {t('accountPage.lastOrder.noOrders')}
            </TP>
        </Stack>
    );
};

const LastOrderWrap = styled(Stack)``;

const StyledLink = styled(Link)`
    width: 100%;
`;

const StyledButton = styled(Button)<{ active?: boolean }>`
    background: ${p => p.active && p.theme.gray(700)};
    font-size: 1.2rem;
`;
