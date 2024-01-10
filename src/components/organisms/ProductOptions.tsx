import { ProductDetailType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/src/components/molecules/Button';
import { TP, Stack } from '@/src/components/atoms';
import { AnimatePresence, motion } from 'framer-motion';

export const ProductOptions: React.FC<{
    variants: ProductDetailType['variants'];
    optionGroups: ProductDetailType['optionGroups'];
    selectedVariant?: ProductDetailType['variants'][number];
    setVariant: (variant?: ProductDetailType['variants'][number]) => void;
    addingError?: string;
}> = ({ variants, optionGroups, selectedVariant, setVariant, addingError }) => {
    const [selectedOptions, setSelectedOptions] = useState<{
        [key: string]: string;
    }>({});

    useEffect(() => {
        const newState = selectedVariant?.options.reduce(
            (acc, option) => {
                acc[option.groupId] = option.id;
                return acc;
            },
            {} as { [key: string]: string },
        );
        if (newState) setSelectedOptions(newState);
    }, [selectedVariant]);

    const handleClick = (groupId: string, id: string) => {
        let newState: { [key: string]: string };
        if (selectedOptions[groupId] === id) {
            newState = { ...selectedOptions };
            delete newState[groupId];
        } else {
            newState = { ...selectedOptions, [groupId]: id };
        }
        setSelectedOptions(newState);
        const variant = variants.find(v => v.options.every(ov => ov.id === newState[ov.groupId]));
        if (variant && variant !== selectedVariant) setVariant(variant);
        else setVariant(undefined);
    };

    const groups = useMemo(() => {
        if (Object.keys(selectedOptions).length <= optionGroups.length - 1) {
            return optionGroups;
        }
        const filteredGroups = optionGroups.filter(og => og.options.some(o => selectedOptions[og.id] === o.id));
        return filteredGroups;
    }, [selectedOptions]);

    return (
        <Stack column gap="2.5rem">
            {groups?.map((og, i) => {
                const variantsInGroup = variants
                    .filter(v => v.options.some(o => o.groupId === og.id))
                    .filter(v => Number(v.stockLevel) > 0);

                return (
                    <StyledStack key={i} column gap="0.5rem">
                        <TP capitalize>{og.name}</TP>
                        <StyledStack gap="1rem">
                            {og.options.map((o, j) => {
                                const totallyOOS = !variantsInGroup.some(v => v.options.some(vo => vo.id === o.id));
                                const handleSwatchClick = () => handleClick(og.id, o.id);

                                if (og.name.toLowerCase() === 'color') {
                                    return (
                                        <ColorSwatch
                                            key={o.name + j}
                                            onClick={handleSwatchClick}
                                            color={o.name}
                                            selected={selectedOptions[og.id] === o.id}
                                            selectable={totallyOOS}
                                        />
                                    );
                                }
                                return (
                                    <SizeSelector
                                        key={o.name + j}
                                        onClick={handleSwatchClick}
                                        selectable={totallyOOS}
                                        selected={selectedOptions[og.id] === o.id}>
                                        {o.name}
                                    </SizeSelector>
                                );
                            })}
                        </StyledStack>
                    </StyledStack>
                );
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

const ColorSwatch = styled.div<{ color: string; selectable: boolean; selected: boolean }>`
    width: 3.2rem;
    height: 3.2rem;
    background-color: ${p => p.color};
    outline: 1px solid ${p => p.theme.gray(500)};
    cursor: pointer;
    ${p =>
        p.selectable &&
        `
        opacity: 0.5;
    `}
    ${p =>
        p.selected &&
        `
        outline: 2px solid ${p.theme.gray(1000)};
    `}
`;

const SizeSelector = styled(Button)<{ selected: boolean; selectable: boolean }>`
    border: 1px solid ${p => p.theme.gray(500)};
    background: ${p => p.theme.gray(0)};
    color: ${p => p.theme.gray(900)};
    :hover {
        background: ${p => p.theme.gray(500)};
        color: ${p => p.theme.gray(0)};
    }
    ${p =>
        p.selected &&
        `
        background: ${p.theme.gray(1000)};
        color: ${p.theme.gray(0)};
    `}

    ${p =>
        p.selectable &&
        `
        background: ${p.theme.gray(500)};
        color: ${p.theme.gray(0)};
    `}
`;

const StyledStack = styled(Stack)`
    justify-content: center;
    align-items: center;
    @media (min-width: 1024px) {
        justify-content: flex-start;
        align-items: flex-start;
    }
`;
