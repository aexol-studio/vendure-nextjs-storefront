import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Link } from '@/src/components/atoms/Link';
import { Stack } from '@/src/components/atoms/Stack';
import { CollectionTileType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';

export const CategoryBar = ({ collections }: { collections: CollectionTileType[] }) => {
    return (
        <Main>
            <ContentContainer>
                <Stack itemsCenter justifyBetween gap="3rem">
                    {collections.map(c => (
                        <Cat key={c.id} href={`/collections/${c.slug}`}>
                            {c.name}
                        </Cat>
                    ))}
                </Stack>
            </ContentContainer>
        </Main>
    );
};
const Cat = styled(Link)`
    text-transform: uppercase;
    font-weight: 600;
    font-size: 1.25rem;
    color: ${p => p.theme.gray(800)};
`;
const Main = styled(Stack)`
    padding: 2rem 0;
`;
