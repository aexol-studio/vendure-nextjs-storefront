import { SSRQuery } from '@/src/graphql/client';
import { ActiveOrderSelector, AvailablePaymentMethodsSelector } from '@/src/graphql/selectors';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { redirectFromDefaultChannelSSR, prepareSSRRedirect } from '@/src/lib/redirect';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const translationRedirect = redirectFromDefaultChannelSSR(context);
    if (translationRedirect) return translationRedirect;
    const homePageRedirect = prepareSSRRedirect('/')(context);
    const api = SSRQuery(context);

    try {
        const [{ activeOrder: checkout }, { eligiblePaymentMethods }] = await Promise.all([
            api({ activeOrder: ActiveOrderSelector }),
            api({ eligiblePaymentMethods: AvailablePaymentMethodsSelector }),
        ]);

        //If no active order, redirect to homepage
        if (!checkout || checkout.lines.length === 0) {
            throw new Error('No active order');
        }
        //If stripe is available, create a payment intent
        // let paymentIntent = null;
        // if (eligiblePaymentMethods.find(method => method?.code === 'stripe')) {
        //     const { createStripePaymentIntent } = await SSRMutation(context)({
        //         createStripePaymentIntent: true,
        //     });
        //     paymentIntent = createStripePaymentIntent;
        // }

        const returnedStuff = {
            ...r.props,
            ...r.context,
            checkout,
            eligiblePaymentMethods,
            stripeData: { paymentIntent: null },
        };

        return { props: returnedStuff };
    } catch (e) {
        //If error, redirect to homepage
        return homePageRedirect;
    }
};
