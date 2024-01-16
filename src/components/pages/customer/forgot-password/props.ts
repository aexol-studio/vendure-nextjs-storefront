import { getCollections } from '@/src/graphql/sharedQueries';
import { makeServerSideProps } from '@/src/lib/getStatic';
import { arrayToTree } from '@/src/util/arrayToTree';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections(r.context);
    const navigation = arrayToTree(collections);

    const returnedStuff = {
        ...r.props,
        ...r.context,
        collections,
        navigation,
    };

    return { props: returnedStuff };
};
