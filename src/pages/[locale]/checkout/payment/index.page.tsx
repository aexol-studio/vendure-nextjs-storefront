import React, { useEffect } from 'react';
import { Layout } from '@/src/layouts';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { makeStaticProps } from '@/src/lib/getStatic';
import { OrderSummary } from '../components/OrderSummary';
import { OrderPayment } from '../components/OrderPayment';
import { getCollections } from '@/src/graphql/sharedQueries';
import { Content, Main } from '../components/ui/Shared';
import { useRouter } from 'next/router';
import { useCart } from '@/src/state/cart';
import { ActiveOrderSelector } from '@/src/graphql/selectors';
import { VendureChain } from '@/src/graphql/client';

const PaymentPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { cart } = useCart();
    const { push } = useRouter();

    useEffect(() => {
        if (!cart || cart.lines.length === 0) push('/');
    }, [cart]);

    return (
        <Layout categories={props.collections}>
            <Content>
                <Main>
                    <OrderPayment />
                    <OrderSummary />
                </Main>
            </Content>
        </Layout>
    );
};

const getServerSideProps: GetServerSideProps = async context => {
    const r = await makeStaticProps(['common', 'checkout'])({
        params: { locale: (context.params?.locale as string) || 'en' },
    });
    const collections = await getCollections();

    const authCookies = {
        session: context.req.cookies['session'],
        'session.sig': context.req.cookies['session.sig'],
    };

    try {
        const { activeOrder } = await VendureChain(`${process.env.NEXT_PUBLIC_VENDURE_HOST}/shop-api`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                Cookie: `session=${authCookies.session}; session.sig=${authCookies['session.sig']}`,
                'Content-Type': 'application/json',
            },
        })('query')({
            activeOrder: ActiveOrderSelector,
        });
        console.log('activeOrder', activeOrder);
    } catch (e) {
        console.log('error', e);
    }

    return {
        props: { ...r.props, collections },
    };
};

// const getServerSideProps = async context => {
//     const authCookies = {
//         session: context.req.cookies['session'],
//         'session.sig': context.req.cookies['session.sig'],
//     };
//     console.log('context', authCookies);
//     try {
//         const { activeOrder } = await VendureChain(`${process.env.NEXT_PUBLIC_VENDURE_HOST}/shop-api`, {
//             method: 'POST',
//             credentials: 'include',
//             headers: {
//                 Cookie: `session=${authCookies.session}; session.sig=${authCookies['session.sig']}`,
//                 'Content-Type': 'application/json',
//             },
//         })('query')({
//             activeOrder: ActiveOrderSelector,
//         });
//         console.log('activeOrder', activeOrder);
//     } catch (e) {
//         console.log('error', e);
//     }

//     const r = await makeStaticProps(['common', 'checkout'])(context);
//     const collections = await getCollections();

//     const { availableCountries } = await storefrontApiQuery({
//         availableCountries: AvailableCountriesSelector,
//     });

//     const YMALProducts = await getYMALProducts();

//     const returnedStuff = {
//         ...r.props,
//         collections,
//         availableCountries,
//         YMALProducts,
//     };

//     return { props: returnedStuff };
// };

export { getServerSideProps };
export default PaymentPage;
