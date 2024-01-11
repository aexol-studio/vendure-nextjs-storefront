import { Stack } from '@/src/components/atoms';
import { IconButton } from '@/src/components/molecules/Button';
import styled from '@emotion/styled';
import { Minus, Plus } from 'lucide-react';

export const QuantityCounter = ({ onChange, v }: { onChange: (v: number) => void; v: number }) => {
    return (
        <Main itemsCenter>
            <IconButtonStatic onClick={() => onChange(v - 1)}>
                <MinWidth>
                    <Minus size={'2.5rem'} />
                </MinWidth>
            </IconButtonStatic>
            <span>{v}</span>
            <IconButtonStatic onClick={() => onChange(v + 1)}>
                <MinWidth>
                    <Plus size={'2.5rem'} />
                </MinWidth>
            </IconButtonStatic>
        </Main>
    );
};

const MinWidth = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const IconButtonStatic = styled(IconButton)`
    padding: 1.75rem;
`;

const Main = styled(Stack)`
    border: 1px solid ${p => p.theme.gray(100)};
    color: ${p => p.theme.gray(900)};
    align-self: flex-start;
    width: auto;
    font-size: 2rem;
    font-weight: 600;
    span {
        margin: 0 1rem;
        font-size: 1.8rem;
        font-weight: 600;
        line-height: 1.5rem;
        user-select: none;
    }
`;
