import { Stack } from '@/src/components/atoms/Stack';
import { TFacetHeading } from '@/src/components/atoms/TypoGraphy';
import { FacetType } from '@/src/graphql/selectors';

interface FacetProps {
    facet: FacetType;
}

export const FacetFilterCheckbox: React.FC<FacetProps> = ({ facet: { code, name, values } }) => {
    return (
        <Stack column gap="4rem">
            <TFacetHeading>{name}</TFacetHeading>
            <Stack column gap="0.5rem">
                {values.map(v => (
                    <Stack key={v.id}>
                        <input type="checkbox" />
                        <label>{v.name}</label>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
};
