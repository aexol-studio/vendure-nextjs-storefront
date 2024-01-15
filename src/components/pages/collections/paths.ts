import { getCollectionsPaths } from '@/src/graphql/sharedQueries';
import { localizeGetStaticPaths } from '@/src/lib/getStatic';

export const getStaticPaths = async () => {
    const resp = await getCollectionsPaths();
    console.log(resp);
    const paths = localizeGetStaticPaths(resp.map(collection => ({ params: { ...collection?.params } })));
    console.dir(paths, { depth: null });
    return { paths, fallback: false };
};
