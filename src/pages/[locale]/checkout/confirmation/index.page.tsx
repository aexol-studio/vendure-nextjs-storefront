import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { Trans } from 'react-i18next';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { TH1, TP } from '@/src/components/atoms/TypoGraphy';
import { ProductImage } from '@/src/components/atoms/ProductImage';
import { CheckCircle2 } from 'lucide-react';
import { Divider } from '@/src/components/atoms/Divider';
import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { getCollections } from '@/src/graphql/sharedQueries';
import { storefrontApiQuery } from '@/src/graphql/client';

import { CheckoutStatus } from '../components/ui/CheckoutStatus';

import { OrderSelector, OrderType } from '@/src/graphql/selectors';
import { priceFormatter } from '@/src/util/priceFomatter';
const ConfirmationPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { query } = useRouter();
    const code = query.code as string;
    const { t } = useTranslation('checkout');
    const [order, setOrder] = useState<OrderType>();
    console.log(order);

    useEffect(() => {
        storefrontApiQuery({
            orderByCode: [{ code }, OrderSelector],
        }).then(r => {
            setOrder(r.orderByCode);
        });
    }, [code]);

    return (
        <Layout categories={props.collections}>
            <ContentContainer style={{ marginBlock: '4rem' }}>
                <Stack style={{ paddingBlock: '2rem' }}>
                    <CheckoutStatus step={'confirmation'} />
                </Stack>
                <Stack column gap="4rem">
                    <Stack itemsCenter gap="2rem">
                        <CheckCircle2 color="green" size={44} />
                        <TH1>Order Summary</TH1>
                    </Stack>
                    <TP size="2rem">
                        <Trans
                            i18nKey="confirmation.orderReceived"
                            t={t}
                            values={{ code }}
                            components={{ 1: <strong></strong> }}
                        />
                    </TP>
                    {order?.lines.map(line => {
                        const isDefaultVariant = line.productVariant.name.includes(line.productVariant.product.name);
                        return (
                            <Stack key={line.productVariant.name} column>
                                <Stack justifyBetween>
                                    <Stack gap="3rem">
                                        <ProductImage src={line.featuredAsset?.preview} size="thumbnail-big" />
                                        <Stack column>
                                            <TP size="2rem" weight={600} style={{ paddingBottom: '2rem' }}>
                                                {!isDefaultVariant
                                                    ? `${line.productVariant.product.name} ${line.productVariant.name}`
                                                    : line.productVariant.name}
                                            </TP>
                                            <Stack gap="1rem">
                                                <TP size="1.75rem">{t('orderSummary.quantity')} </TP>
                                                <TP size="1.75rem" weight={600}>
                                                    {line.quantity}
                                                </TP>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                    <TP size="2rem" weight={600}>
                                        {priceFormatter(line.linePriceWithTax, line.productVariant.currencyCode)}
                                    </TP>
                                </Stack>
                                <Divider style={{ marginBlock: '3rem' }} />
                            </Stack>
                        );
                    })}
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'checkout'])(context);
    const collections = await getCollections();

    const returnedStuff = {
        ...r.props,
        collections,
    };
    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export { getStaticPaths, getStaticProps };
export default ConfirmationPage;
