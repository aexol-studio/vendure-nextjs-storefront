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
            <Stack gap="1rem" column>
                <TP style={{ whiteSpace: 'nowrap' }} size="1.75rem" weight={600}>
                    {t('accountPage.lastOrder.title')}
                </TP>
                <OrderState itemsCenter state={order.state} />
            </Stack>
            <Stack gap="1.5rem">
                <ProductImage
                    size="thumbnail-big"
                    src={order?.lines[0]?.featuredAsset?.preview}
                    alt={order.code}
                    title={order.code}
                />
                <Stack column gap="0.5rem">
                    <Stack column>
                        <TP size="1.25rem" weight={500}>
                            {t('accountPage.lastOrder.orderCode')}:&nbsp;
                        </TP>
                        <TP size="1.5rem">{order.code}</TP>
                    </Stack>
                    <Stack>
                        <TP size="1.25rem" weight={500}>
                            {t('accountPage.lastOrder.orderDate')}:&nbsp;
                        </TP>
                        <TP size="1.25rem">{dateFormatter(order.createdAt, 'date')}</TP>
                    </Stack>
                    <Stack>
                        <TP size="1.25rem" weight={500}>
                            {t('accountPage.lastOrder.totalQuantity')}:&nbsp;
                        </TP>
                        <TP size="1.25rem">{order?.totalQuantity}</TP>
                    </Stack>
                    <Stack>
                        <TP size="1.25rem" weight={500}>
                            {t('accountPage.lastOrder.totalProducts')}:&nbsp;
                        </TP>
                        <TP size="1.25rem">{order?.lines.length}</TP>
                    </Stack>
                    <Stack>
                        <TP size="1.25rem" weight={500}>
                            {t('accountPage.lastOrder.totalPrice')}:&nbsp;
                        </TP>
                        <Price size="1.25rem" currencyCode={order?.currencyCode} price={order?.totalWithTax} />
                    </Stack>
                </Stack>
                <StyledLink href={`/customer/manage/orders/${order?.code}`} style={{ alignSelf: 'flex-end' }}>
                    <StyledButton>{t('accountPage.lastOrder.viewOrder')}</StyledButton>
                </StyledLink>
            </Stack>
        </LastOrderWrap>
    ) : (
        <Stack>
            <TP size="1.75rem" weight={600}>
                {t('accountPage.lastOrder.noOrders')}
            </TP>
        </Stack>
    );
};

const LastOrderWrap = styled(Stack)`
    padding: 1.5rem 1rem;
    box-shadow: 0.2rem 0.2rem 0.2rem ${p => p.theme.shadow};

    border-left: 0.1rem solid ${p => p.theme.shadow};
    border-top: 0.1rem solid ${p => p.theme.shadow};
`;

const StyledLink = styled(Link)``;

const StyledButton = styled(Button)<{ active?: boolean }>`
    background: ${p => p.active && p.theme.gray(700)};
    font-size: 1.2rem;
`;
