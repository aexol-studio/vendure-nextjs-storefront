import { Stack } from '@/src/components/atoms/Stack';
import { IconButton } from '@/src/components/molecules/Button';
import styled from '@emotion/styled';
import { Minus, Plus } from 'lucide-react';

export const QuantityCounter = ({ onChange, v }: { onChange: (v: number) => void; v: number }) => {
    return (
        <Main gap="4rem" itemsCenter>
            <IconButton>
                <Minus onClick={() => onChange(v - 1)} />
            </IconButton>
            <span>{v}</span>
            <IconButton>
                <Plus onClick={() => onChange(v + 1)} />
            </IconButton>
        </Main>
    );
};

const Main = styled(Stack)`
    border: 1px solid ${p => p.theme.gray(100)};
    padding: 1.6rem;
    color: ${p => p.theme.gray(900)};
    align-self: flex-start;
    width: auto;
    font-size: 2rem;
    font-weight: 600;
`;
