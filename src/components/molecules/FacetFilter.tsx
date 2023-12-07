import { Stack } from '@/src/components/atoms/Stack';
import { TFacetHeading, TP } from '@/src/components/atoms/TypoGraphy';
import { FacetType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';

interface FacetProps {
    facet: FacetType;
}

export const FacetFilterCheckbox: React.FC<FacetProps> = ({ facet: { name, values } }) => {
    return (
        <Main column gap="2rem">
            <TFacetHeading upperCase>{name}</TFacetHeading>
            <CheckGrid>
                {values.map(v => (
                    <Stack gap="1rem" key={v.id}>
                        <input type="checkbox" />
                        <TP weight={400} as="label">
                            {v.name}
                        </TP>
                    </Stack>
                ))}
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
