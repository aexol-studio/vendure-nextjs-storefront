import React, { useState } from 'react';
import { Stack, TP } from '@/src/components/atoms';
import styled from '@emotion/styled';
import { MinusIcon, PlusIcon } from 'lucide-react';

export const ProductDescription: React.FC<{
    data: { title: string; children: React.ReactNode }[];
    defaultOpenIndexes?: number[];
}> = ({ data, defaultOpenIndexes }) => {
    const [open, setOpen] = useState<Record<string, boolean>>(
        data.reduce((acc, key) => {
            if (defaultOpenIndexes?.includes(data.indexOf(key))) return { ...acc, [key.title]: true };
            return { ...acc, [key.title]: false };
        }, {}),
    );

    return (
        <Stack w100 column gap="2rem" style={{ marginTop: '3.5rem' }}>
            {data.map((entry, index) => (
                <GridWrapper key={index} w100 column>
                    <GridTitle onClick={() => setOpen({ ...open, [entry.title]: !open[entry.title] })}>
                        <TP size="1.5rem" weight={400}>
                            {entry.title}
                        </TP>
                        {open[entry.title] ? <MinusIcon size="1.5rem" /> : <PlusIcon size="1.5rem" />}
                    </GridTitle>
                    <Grid open={open[entry.title]}>
                        <GridEntry>{entry.children}</GridEntry>
                    </Grid>
                    <Line />
                </GridWrapper>
            ))}
        </Stack>
    );
};

const Line = styled.div`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.gray(100)};
    margin-top: 2rem;
`;

const GridWrapper = styled(Stack)``;

const Grid = styled.div<{ open: boolean }>`
    display: grid;
    grid-template-rows: ${({ open }) => (open ? '1fr' : '0fr')};
    transition: grid-template-rows 0.3s ease-in-out;
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
