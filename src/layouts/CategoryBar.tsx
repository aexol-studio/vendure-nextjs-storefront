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
                    {collections.map(c => {
                        const href =
                            c.parent?.slug !== '__root_collection__'
                                ? `/collections/${c.parent?.slug}/${c.slug}`
                                : `/collections/${c.slug}`;
                        return (
                            <Cat key={c.id} href={href}>
                                {c.name}
                            </Cat>
                        );
                    })}
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

    white-space: nowrap;
`;
const Main = styled(Stack)`
    padding: 4rem 0;
    overflow-x: auto;

    @media (min-width: ${p => p.theme.breakpoints.lg}) {
        display: none;
    }
`;
