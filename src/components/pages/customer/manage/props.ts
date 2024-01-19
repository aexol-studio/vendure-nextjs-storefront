import { SSRQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, ActiveOrderSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { prepareSSRRedirect, redirectFromDefaultChannelSSR } from '@/src/lib/redirect';
import { arrayToTree } from '@/src/util/arrayToTree';
import { SortOrder } from '@/src/zeus';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const translationRedirect = redirectFromDefaultChannelSSR(context);
    if (translationRedirect) return translationRedirect;

    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);
    const homePageRedirect = prepareSSRRedirect('/')(context);

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: {
                ...ActiveCustomerSelector,
                orders: [
                    { options: { take: 1, sort: { updatedAt: SortOrder.DESC }, filter: { active: { eq: false } } } },
                    { items: ActiveOrderSelector },
                ],
            },
        });
        if (!activeCustomer) throw new Error('No active customer');

        const { orders, ...customer } = activeCustomer;

        const returnedStuff = {
            ...r.props,
            ...r.context,
            collections,
            activeCustomer: customer,
            lastOrder: orders.items && orders.items.length > 0 ? orders.items[0] : null,
            navigation,
        };

        return { props: returnedStuff };
    } catch (error) {
        return homePageRedirect;
    }
};
