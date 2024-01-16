import { SSRQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, ActiveOrderSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortOrder } from '@/src/zeus';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);

    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);
    const homePageRedirect = prepareSSRRedirect('/')(context);

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: {
                ...ActiveCustomerSelector,
                orders: [
                    { options: { take: 4, sort: { createdAt: SortOrder.DESC }, filter: { active: { eq: false } } } },
                    { items: ActiveOrderSelector, totalItems: true },
                ],
            },
        });
        if (!activeCustomer) throw new Error('No active customer');

        const returnedStuff = {
            ...r.props,
            ...r.context,
            collections,
            activeCustomer,
            navigation,
        };

        return { props: returnedStuff };
    } catch (error) {
        return homePageRedirect;
    }
};
