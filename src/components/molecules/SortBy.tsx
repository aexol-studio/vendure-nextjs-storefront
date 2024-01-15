import { sortOptions } from '@/src/state/collection/utils';
import React, { useRef, useState } from 'react';
import { Stack, TP } from '@/src/components/atoms';
import { Sort } from '@/src/state/collection/types';
import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useOutsideClick } from '@/src/util/hooks/useOutsideClick';
import { ChevronRight } from 'lucide-react';

interface Props {
    sort: Sort;
    handleSort: (sort: Sort) => Promise<void>;
}

export const SortBy: React.FC<Props> = ({ handleSort, sort }) => {
    const { t } = useTranslation('collections');
    const [open, setOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, () => setOpen(false));

    return (
        <Container gap="0.5rem">
            <Relative ref={ref} itemsCenter justifyBetween>
                <Option itemsCenter onClick={() => setOpen(!open)} gap="0.75rem">
                    <Stack itemsEnd>
                        <TP capitalize>{t('sort-by')}</TP>
                    </Stack>
                    <IconWrapper justifyCenter itemsCenter>
                        <ChevronRight />
                    </IconWrapper>
                </Option>
                <AnimatePresence>
                    {open && (
                        <Wrapper
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}>
                            {sortOptions.map(o => (
                                <StyledOption
                                    selected={o.key == sort.key && o.direction == sort.direction}
                                    itemsCenter
                                    key={o.key + o.direction}
                                    onClick={async () => {
                                        setOpen(false);
                                        await handleSort(o);
                                    }}>
                                    <Stack itemsCenter>
                                        <TP capitalize weight={400} size="1.5rem">
                                            {o.key}&nbsp;
                                        </TP>
                                        <TP capitalize weight={400} size="1.5rem">
                                            ({t(`sort-directions.${o.direction}`)})
                                        </TP>
                                    </Stack>
                                </StyledOption>
                            ))}
                        </Wrapper>
                    )}
                </AnimatePresence>
            </Relative>
        </Container>
    );
};

const IconWrapper = styled(Stack)`
    width: 1.75rem;
    height: 1.75rem;
`;

const Container = styled(Stack)``;

const Relative = styled(Stack)`
    position: relative;
`;

const Wrapper = styled(motion.div)`
    top: 3rem;
    right: 0;
    position: absolute;
    z-index: 1;
    width: 21rem;
    display: flex;
    flex-direction: column;
    background: ${({ theme }) => theme.background.main};
    border: 1px solid ${({ theme }) => theme.button.back};
`;

const Option = styled(Stack)`
    cursor: pointer;
    user-select: none;
`;
const StyledOption = styled(Stack)<{ selected: boolean }>`
    cursor: pointer;
    user-select: none;
    justify-content: space-between;
    padding: 1.8rem 2.4rem;
    background-color: ${({ theme, selected }) => (selected ? `${theme.background.third}` : 'unset')};
`;
