import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { orderStateToIcon } from '@/src/util/orderStateToIcon';
import styled from '@emotion/styled';
import React from 'react';

interface Props {
    state: string;
}

const states = ['Payment', 'Shipped', 'Delivered'];

export const CustomerOrderStates: React.FC<Props> = ({ state }) => {
    const _state = states.includes(state) ? state : states[0];

    return (
        <Stack justifyCenter gap="5rem">
            {states.map((s, i) => (
                <Stack column itemsCenter key={s} gap="0.5rem">
                    <Circle justifyCenter itemsCenter key={i} active={_state.includes(s)}>
                        {orderStateToIcon(s, 18)}
                    </Circle>
                    <TP>{s}</TP>
                </Stack>
            ))}
        </Stack>
    );
};

const Circle = styled(Stack)<{ wasActive?: boolean; active?: boolean }>`
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 100%;
    border: 1px solid ${p => p.theme.gray(100)};
    background-color: ${p => (p.active ? p.theme.success : p.theme.gray(100))};
    box-shadow: 0 0.25rem 0.25rem 0 ${({ theme }) => theme.shadow};
`;
