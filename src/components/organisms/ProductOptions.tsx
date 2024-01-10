import styled from '@emotion/styled';
import { Button } from '@/src/components/molecules/Button';
import { TP, Stack } from '@/src/components/atoms';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductOptionsGroup } from '@/src/state/product/types';

interface ProductOptionsProps {
    productOptionsGroups: ProductOptionsGroup[];
    handleClick: (groupId: string, optionId: string) => void;
    addingError?: string;
}

export const ProductOptions: React.FC<ProductOptionsProps> = ({ productOptionsGroups, handleClick, addingError }) => {
    return (
        <Stack column gap="2.5rem">
            {productOptionsGroups?.map((og, i) => {
                return og.options.length ? (
                    <StyledStack key={i} column gap="0.5rem">
                        <TP capitalize>{og.name}</TP>
                        <StyledStack gap="1rem">
                            {og.options.map((o, j) => {
                                if (og.name.toLowerCase() === 'color') {
                                    return (
                                        <ColorSwatch
                                            outOfStock={!(o.stockLevel > 0)}
                                            key={o.name + j}
                                            onClick={() => handleClick(og.id, o.id)}
                                            color={o.name}
                                            selected={o.isSelected}
                                        />
                                    );
                                }
                                return (
                                    <SizeSelector
                                        outOfStock={!(o.stockLevel > 0)}
                                        key={o.name + j}
                                        onClick={() => handleClick(og.id, o.id)}
                                        selected={o.isSelected}>
                                        {o.name}
                                    </SizeSelector>
                                );
                            })}
                        </StyledStack>
                    </StyledStack>
                ) : null;
            })}
            <AnimatePresence>
                {addingError && (
                    <NoVariantInfo
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}>
                        <Error size="1.25rem">{addingError}</Error>
                    </NoVariantInfo>
                )}
            </AnimatePresence>
        </Stack>
    );
};

const Error = styled(TP)`
    color: ${({ theme }) => theme.error};
`;

const NoVariantInfo = styled(motion.div)``;

const ColorSwatch = styled.div<{ color: string; outOfStock: boolean; selected: boolean }>`
    width: 3.2rem;
    height: 3.2rem;
    background-color: ${p => p.color};
    outline: 1px solid ${p => p.theme.gray(500)};
    cursor: pointer;
    ${p => p.outOfStock && `opacity: 0.5;`}
    ${p => p.selected && `outline: 2px solid ${p.theme.gray(1000)};`}
`;

const SizeSelector = styled(Button)<{ selected: boolean; outOfStock: boolean }>`
    border: 1px solid ${p => p.theme.gray(500)};
    background: ${p => p.theme.gray(0)};
    color: ${p => p.theme.gray(900)};
    :hover {
        background: ${p => p.theme.gray(500)};
        color: ${p => p.theme.gray(0)};
    }
    ${p =>
        p.selected ? `background: ${p.theme.gray(1000)}; color: ${p.theme.gray(0)};` : p.outOfStock && `opacity: 0.5;`}
`;

const StyledStack = styled(Stack)`
    justify-content: center;
    align-items: center;
    @media (min-width: 1024px) {
        justify-content: flex-start;
        align-items: flex-start;
    }
`;
