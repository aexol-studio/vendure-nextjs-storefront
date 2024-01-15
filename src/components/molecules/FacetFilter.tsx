import { Stack, TFacetHeading } from '@/src/components/atoms';
import { FiltersFacetType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { CheckBox } from '@/src/components/forms';
import { useState } from 'react';

interface FacetProps {
    facet: FiltersFacetType;
    selected?: string[];
    onClick: (group: { id: string; name: string }, facet: { id: string; name: string }) => void;
}

export const FacetFilterCheckbox: React.FC<FacetProps> = ({ facet: { id, name, values }, onClick, selected }) => {
    const [open, setOpen] = useState<boolean>(true);
    return (
        <GridWrapper w100 column>
            <GridTitle onClick={() => setOpen(!open)}>
                <TFacetHeading upperCase>{name}</TFacetHeading>
            </GridTitle>
            <Grid open={open}>
                <GridEntry>
                    <CheckGrid>
                        {values.map(v => {
                            const isSelected = selected?.includes(v.id);
                            return (
                                <CheckBox
                                    key={v.id}
                                    label={`${v.name} (${v.count})`}
                                    checked={isSelected}
                                    onChange={() => onClick({ id, name }, v)}
                                />
                            );
                        })}
                    </CheckGrid>
                </GridEntry>
            </Grid>
        </GridWrapper>
    );
};

const GridWrapper = styled(Stack)`
    margin-top: 2rem;
    min-width: 420px;
    max-width: 100%;
`;

const Grid = styled.div<{ open: boolean }>`
    margin-top: 2rem;
    display: grid;
    grid-template-rows: ${({ open }) => (open ? '1fr' : '0fr')};
    transition: grid-template-rows 0.3s ease-in-out;
    border-bottom: 1px solid ${p => p.theme.gray(100)};
`;

const GridTitle = styled.button`
    width: 100%;
    border: none;
    background-color: transparent;
    padding: 0;
    cursor: pointer;

    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const GridEntry = styled(Stack)`
    overflow: hidden;
`;

const CheckGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding-bottom: 2rem;
`;
