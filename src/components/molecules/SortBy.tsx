import { sortOptions } from '@/src/state/collection/utils';
import React, { useRef, useState } from 'react';
import { Stack, TP } from '@/src/components/atoms';
import { SortAsc, SortDesc } from 'lucide-react';
import { Sort } from '@/src/state/collection/types';
import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useOutsideClick } from '@/src/util/hooks/useOutsideClick';

interface Props {
    sort: Sort;
    handleSort: (sort: Sort) => Promise<void>;
}

type SortKey = (typeof sortOptions)[number]['key'];

export const SortBy: React.FC<Props> = ({ handleSort, sort }) => {
    const { t } = useTranslation('collections');
    const [open, setOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, () => setOpen(false));

    return (
        <Container gap="0.5rem">
            <Relative ref={ref} itemsCenter justifyBetween>
                <StyledOption itemsCenter onClick={() => setOpen(!open)} gap="0.75rem">
                    <Stack itemsEnd>
                        <TP capitalize>
                            {t('sort-by')}: {t(`sort-keys.${sort.key as SortKey}`)}&nbsp;
                        </TP>
                        <TP capitalize>({t(`sort-directions.${sort.direction}`)})</TP>
                    </Stack>

                    <IconWrapper justifyCenter itemsCenter>
                        {sort.direction === 'ASC' ? <SortAsc size="1.75rem" /> : <SortDesc size="1.75rem" />}
                    </IconWrapper>
                </StyledOption>
                <AnimatePresence>
                    {open && (
                        <Wrapper
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}>
                            {sortOptions
                                .filter(o => o.key !== sort.key || o.direction !== sort.direction)
                                .map(o => (
                                    <StyledOption
                                        itemsCenter
                                        key={o.key + o.direction}
                                        onClick={async () => {
                                            setOpen(false);
                                            await handleSort(o);
                                        }}>
                                        <Stack itemsCenter>
                                            <TP capitalize weight={400} size="1.25rem">
                                                {o.key}&nbsp;
                                            </TP>
                                            <TP capitalize weight={400} size="1.25rem">
                                                ({t(`sort-directions.${o.direction}`)})
                                            </TP>
                                        </Stack>
                                        <IconWrapper justifyCenter itemsCenter>
                                            {o.direction === 'ASC' ? (
                                                <SortAsc size="1.75rem" />
                                            ) : (
                                                <SortDesc size="1.75rem" />
                                            )}
                                        </IconWrapper>
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
    top: 100%;
    left: -1.5rem;
    position: absolute;
    z-index: 1;
    width: calc(100% + 3rem);

    display: flex;
    flex-direction: column;
    gap: 1rem;

    padding: 2rem;

    background: ${({ theme }) => theme.background.secondary};
    box-shadow: 0 0.2rem 0.1rem ${({ theme }) => theme.shadow};
`;

const StyledOption = styled(Stack)`
    cursor: pointer;
    user-select: none;
    justify-content: space-between;

    :hover {
        opacity: 0.8;
    }
`;
