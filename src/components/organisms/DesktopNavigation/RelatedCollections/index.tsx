import { CollectionTileType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';
import { useTranslation } from 'next-i18next';
import { Stack, ProductImage, Link, TP } from '@/src/components/atoms';
import styled from '@emotion/styled';

export const RelatedCollections: React.FC<{ collection: RootNode<CollectionTileType>['children'][number] }> = ({
    collection,
}) => {
    const { t } = useTranslation('common');
    return (
        <Stack column gap="1.5rem">
            <TP size="1.5rem" weight={500}>
                {t('related-collections')}
            </TP>
            <Stack itemsCenter gap="2rem">
                {collection.children.slice(0, 2).map(children => (
                    <Stack key={children.name + '2'} column gap="1rem">
                        <Link href={`/collections/${children.slug}`}>
                            <ProductImage src={children.featuredAsset?.preview || ''} size="thumbnail-big" />
                        </Link>
                        <StyledLink href={`/collections/${children.slug}`}>
                            {children.name} ({children.productVariants.totalItems})
                        </StyledLink>
                    </Stack>
                ))}
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
