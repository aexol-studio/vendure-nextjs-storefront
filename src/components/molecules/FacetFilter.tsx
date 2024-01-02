import { Stack, TFacetHeading, TP } from '@/src/components/atoms';
import { FiltersFacetType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';

interface FacetProps {
    facet: FiltersFacetType;
    selected?: string[];
    onClick: (group: { id: string; name: string }, facet: { id: string; name: string }) => void;
}

export const FacetFilterCheckbox: React.FC<FacetProps> = ({ facet: { id, name, values }, onClick, selected }) => {
    return (
        <Main column gap="2rem">
            <TFacetHeading upperCase>{name}</TFacetHeading>
            <CheckGrid>
                {values.map(v => {
                    const isSelected = selected?.includes(v.id);
                    return (
                        <Stack gap="1rem" key={v.id} itemsCenter onClick={() => onClick({ id, name }, v)}>
                            <input checked={isSelected} type="checkbox" />
                            <TP weight={400} as="label">
                                {v.name} ({v.count})
                            </TP>
                        </Stack>
                    );
                })}
            </CheckGrid>
        </Main>
    );
};
const Main = styled(Stack)`
    min-width: 420px;
    max-width: 100%;
    padding-top: 2rem;
`;
const CheckGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid ${p => p.theme.gray(100)};
`;
