import { SSRQuery } from '@/src/graphql/client';
import { ActiveOrderSelector, AvailableCountriesSelector } from '@/src/graphql/selectors';
import { getYMALProducts } from '@/src/graphql/sharedQueries';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const language = (context.params?.locale as string) ?? 'en';

    const homePageRedirect = prepareSSRRedirect('/')(context);
    const paymentRedirect = prepareSSRRedirect('/checkout/payment')(context);

    try {
        const [{ activeOrder: checkout }, { availableCountries }] = await Promise.all([
            SSRQuery(context)({ activeOrder: ActiveOrderSelector }),
            SSRQuery(context)({ availableCountries: AvailableCountriesSelector }),
        ]);
        const YMALProducts = await getYMALProducts(r.context);

        if (checkout?.state === 'ArrangingPayment') {
            return paymentRedirect;
        }

        if (!checkout || checkout.lines.length === 0) {
            return homePageRedirect;
        }

        const returnedStuff = {
            ...r.props,
            ...r.context,
            availableCountries,
            checkout,
            YMALProducts,
            language,
        };

        return { props: returnedStuff };
    } catch (e) {
        return homePageRedirect;
    }
};
