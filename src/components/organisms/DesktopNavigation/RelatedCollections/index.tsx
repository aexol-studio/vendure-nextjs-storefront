import { NavigationType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';
import { Stack, ProductImage, Link, TP } from '@/src/components/atoms';
import styled from '@emotion/styled';

export const RelatedCollections: React.FC<{
    title: string;
    collection: RootNode<NavigationType>['children'][number];
}> = ({ title, collection }) => {
    if (!collection || collection?.children?.length === 0) return null;
    return (
        <Stack column gap="1.5rem">
            <TP size="1.5rem" weight={500}>
                {title}
            </TP>
            <Stack itemsCenter gap="2rem">
                {collection.children.slice(0, 2).map(children => {
                    const href =
                        children.parent?.slug === '__root_collection__'
                            ? `/collections/${children.slug}`
                            : `/collections/${children.parent?.slug}/${children.slug}`;
                    return (
                        <Stack key={children.name + '2'} column gap="1rem">
                            <Link href={href}>
                                <ProductImage
                                    src={children.featuredAsset?.preview || ''}
                                    size="thumbnail-big"
                                    alt={collection.name}
                                    title={collection.name}
                                />
                            </Link>
                            <StyledLink href={href}>
                                {children.name} ({children.productVariants ? children.productVariants.totalItems : 0})
                            </StyledLink>
                        </Stack>
                    );
                })}
            </Stack>
        </Stack>
    );
};

const StyledLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${p => p.theme.text.main};

    text-transform: uppercase;
    font-weight: 700;
    font-size: 1.2rem;
    white-space: nowrap;
`;
