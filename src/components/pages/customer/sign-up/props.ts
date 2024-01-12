import { getCollections } from '@/src/graphql/sharedQueries';
import { ContextModel, makeStaticProps } from '@/src/lib/getStatic';
import { arrayToTree } from '@/src/util/arrayToTree';

export const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'customer'])(context);
    const language = r.props._nextI18Next?.initialLocale ?? 'en';
    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);

    const returnedStuff = {
        ...r.props,
        ...r.context,
        collections,
        navigation,
        language,
    };

    return {
        props: returnedStuff,
        revalidate: process.env.NEXT_REVALIDATE ? parseInt(process.env.NEXT_REVALIDATE) : 10,
    };
};
