import { SSGQuery } from '@/src/graphql/client';
import { channels, DEFAULT_CHANNEL } from '@/src/lib/consts';
import { getAllPossibleWithChannels } from '@/src/lib/getStatic';

const getCollectionsPaths = async () => {
    const allPaths = getAllPossibleWithChannels();
    const resp = await Promise.all(
        allPaths.map(async path => {
            const channel = channels.find(c => c.slug === path.params.channel)?.channel ?? DEFAULT_CHANNEL;
            const data = await SSGQuery({ channel, locale: path.params.locale })({
                collections: [
                    { options: { filter: { slug: { notEq: 'search' } }, topLevelOnly: true } },
                    { items: { id: true, slug: true, children: { id: true, slug: true } } },
                ],
            }).then(d => {
                const routes = d.collections?.items
                    .map(c => {
                        const fullPaths = c.children?.map(child => ({
                            params: {
                                id: child.id,
                                slug: [c.slug, child.slug],
                                locale: path.params.locale,
                                channel: path.params.channel,
                            },
                        }));
                        fullPaths?.push({
                            params: {
                                id: c.id,
                                slug: [c.slug],
                                locale: path.params.locale,
                                channel: path.params.channel,
                            },
                        });
                        return fullPaths;
                    })
                    .flat();
                return routes;
            });
            return data;
        }),
    );
    return resp.flatMap(data => data);
};

export const getStaticPaths = async () => {
    const paths = await getCollectionsPaths();
    return { paths, fallback: false };
};
