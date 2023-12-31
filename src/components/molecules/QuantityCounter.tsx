import { Stack } from '@/src/components/atoms';
import { IconButton } from '@/src/components/molecules/Button';
import styled from '@emotion/styled';
import { Minus, Plus } from 'lucide-react';

export const QuantityCounter = ({ onChange, v }: { onChange: (v: number) => void; v: number }) => {
    return (
        <Main gap="2.5rem" itemsCenter>
            <IconButton>
                <Minus size={24} onClick={() => onChange(v - 1)} />
            </IconButton>
            <span>{v}</span>
            <IconButton>
                <Plus size={24} onClick={() => onChange(v + 1)} />
            </IconButton>
        </Main>
    );
};

const Main = styled(Stack)`
    border: 1px solid ${p => p.theme.gray(100)};
    padding: 0.75rem 1rem;
    color: ${p => p.theme.gray(900)};
    align-self: flex-start;
    width: auto;
    font-size: 2rem;
    font-weight: 600;

    span {
        font-size: 1.8rem;
        font-weight: 600;
        line-height: 2.4rem;
    }
`;
