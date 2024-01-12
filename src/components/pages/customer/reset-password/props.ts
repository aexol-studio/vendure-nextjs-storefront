import { getCollections } from '@/src/graphql/sharedQueries';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { arrayToTree } from '@/src/util/arrayToTree';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const language = (context.params?.locale as string) ?? 'en';

    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);
    const token = context.query.token as string;
    const homePageRedirect = prepareSSRRedirect('/')(context);

    if (!token) return homePageRedirect;

    const returnedStuff = {
        ...r.props,
        ...r.context,
        collections,
        token,
        navigation,
        language,
    };

    return { props: returnedStuff };
};
