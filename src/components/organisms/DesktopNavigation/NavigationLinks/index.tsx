import { CollectionTileType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';
import { Link, Stack, TH2 } from '@/src/components/atoms';
import styled from '@emotion/styled';

export const NavigationLinks: React.FC<{ collection: RootNode<CollectionTileType>['children'][number] }> = ({
    collection,
}) => {
    return (
        <Stack column gap="1.5rem">
            <TH2>{collection.name}</TH2>
            <Stack column>
                {collection.children.map(cc => (
                    <Stack key={cc.name + '1'} style={{ padding: '0.5rem' }}>
                        <NavigationLink href={`/collections/${cc.slug}`}>{cc.name}</NavigationLink>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
};

const NavigationLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${p => p.theme.text.inactive};

    font-weight: 700;
    font-size: 1.5rem;
    white-space: nowrap;

    &:hover {
        color: ${p => p.theme.text.main};
    }
`;
