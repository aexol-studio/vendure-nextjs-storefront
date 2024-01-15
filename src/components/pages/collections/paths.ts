import { getCollectionsPaths } from '@/src/graphql/sharedQueries';
import { localizeGetStaticPaths } from '@/src/lib/getStatic';

export const getStaticPaths = async () => {
    const resp = await getCollectionsPaths();
    const paths = localizeGetStaticPaths(resp.map(collection => ({ params: { ...collection?.params } })));
    return { paths, fallback: false };
};
