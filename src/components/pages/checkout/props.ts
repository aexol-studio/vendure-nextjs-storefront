import { SSRQuery } from '@/src/graphql/client';
import {
    ActiveCustomerSelector,
    ActiveOrderSelector,
    AvailableCountriesSelector,
    ShippingMethodsSelector,
    homePageSlidersSelector,
} from '@/src/graphql/selectors';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);

    const homePageRedirect = prepareSSRRedirect('/')(context);
    const paymentRedirect = prepareSSRRedirect('/checkout/payment')(context);
    const api = SSRQuery(context);

    try {
        const [
            { activeOrder: checkout },
            { availableCountries },
            { activeCustomer },
            { eligibleShippingMethods },
            { collection: alsoBoughtProducts },
        ] = await Promise.all([
            api({ activeOrder: ActiveOrderSelector }),
            api({ availableCountries: AvailableCountriesSelector }),
            api({ activeCustomer: ActiveCustomerSelector }),
            api({ eligibleShippingMethods: ShippingMethodsSelector }),
            api({ collection: [{ slug: 'all' }, homePageSlidersSelector] }),
        ]);

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
            alsoBoughtProducts: alsoBoughtProducts?.productVariants.items ?? null,
            activeCustomer: activeCustomer ?? null,
            eligibleShippingMethods: eligibleShippingMethods ?? null,
        };

        return { props: returnedStuff };
    } catch (e) {
        return homePageRedirect;
    }
};
