import { SSRQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, AvailableCountriesSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { arrayToTree } from '@/src/util/arrayToTree';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const language = (context.params?.locale as string) ?? 'en';

    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);
    const homePageRedirect = prepareSSRRedirect('/')(context);

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: ActiveCustomerSelector,
        });
        if (!activeCustomer) throw new Error('No active customer');

        const { availableCountries } = await SSRQuery(context)({
            availableCountries: AvailableCountriesSelector,
        });

        const returnedStuff = {
            ...r.props,
            ...r.context,
            collections,
            activeCustomer,
            availableCountries,
            navigation,
            language,
        };

        return { props: returnedStuff };
    } catch (error) {
        return homePageRedirect;
    }
};
