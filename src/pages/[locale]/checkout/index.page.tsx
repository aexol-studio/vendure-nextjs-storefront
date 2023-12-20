import { CheckoutLayout } from '@/src/layouts';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React from 'react';
import { OrderSummary } from './components/OrderSummary';
import { OrderForm } from './components/OrderForm';
import { getYMALProducts } from '@/src/graphql/sharedQueries';
import { Content, Main } from './components/ui/Shared';
import { SSRQuery, storefrontApiQuery } from '@/src/graphql/client';
import { ActiveOrderSelector, AvailableCountriesSelector } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms/Stack';
import { MoveLeft } from 'lucide-react';
import { Link } from '@/src/components/atoms/Link';

const CheckoutPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { availableCountries, YMALProducts, activeOrder: initialActiveOrder } = props;

    return (
        <CheckoutLayout initialActiveOrder={initialActiveOrder}>
            <Content>
                <BackButtonWrapper>
                    <BackButton href="/">
                        <MoveLeft size={24} />
                    </BackButton>
                </BackButtonWrapper>
                <Main w100 justifyBetween>
                    <OrderForm availableCountries={availableCountries} />
                    <OrderSummary isForm YMALProducts={YMALProducts} />
                </Main>
            </Content>
        </CheckoutLayout>
    );
};

const BackButtonWrapper = styled(Stack)`
    position: absolute;
    top: 1.5rem;
    left: -1.5rem;
`;
const BackButton = styled(Link)`
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.2rem;
    height: 3.2rem;

    color: ${({ theme }) => theme.gray(1000)};
`;

const getServerSideProps: GetServerSideProps = async context => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const paymentRedirect =
        r.props._nextI18Next?.initialLocale === 'en'
            ? '/checkout/payment'
            : `/${r.props._nextI18Next?.initialLocale}/checkout/payment`;

    const { availableCountries } = await storefrontApiQuery({
        availableCountries: AvailableCountriesSelector,
    });
    const YMALProducts = await getYMALProducts();

    const { activeOrder } = await SSRQuery(context)({
        activeOrder: ActiveOrderSelector,
    });

    if (activeOrder?.state === 'ArrangingPayment') {
        return { redirect: { destination: paymentRedirect, permanent: false } };
    }

    const returnedStuff = { ...r.props, availableCountries, activeOrder, YMALProducts };
    return { props: returnedStuff };
};

export { getServerSideProps };
export default CheckoutPage;
