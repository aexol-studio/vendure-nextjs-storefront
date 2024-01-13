import { SSRQuery } from '@/src/graphql/client';
import { OrderSelector } from '@/src/graphql/selectors';
import { getCollections } from '@/src/graphql/sharedQueries';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { arrayToTree } from '@/src/util/arrayToTree';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'checkout'])(context);
    const homePageRedirect = prepareSSRRedirect('/')(context);
    const language = (context.params?.locale as string) ?? 'en';

    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);
    const code = context.params?.code as string;
    if (!code) return homePageRedirect;

    try {
        const { orderByCode } = await SSRQuery(context)({
            orderByCode: [{ code }, OrderSelector],
        });

        if (!orderByCode || orderByCode.active) throw new Error(`Order not ready yet ${code}`);

        const returnedStuff = {
            ...r.props,
            ...r.context,
            collections,
            code,
            orderByCode,
            navigation,
            language,
        };

        return { props: returnedStuff };
    } catch (e) {
        return { props: { ...r.props, ...r.context, collections, code, navigation, orderByCode: null, language } };
    }
};
