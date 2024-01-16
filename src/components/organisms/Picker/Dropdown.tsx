import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, TypoGraphy } from '@/src/components';
import { ChevronDown } from 'lucide-react';
import { useOutsideClick } from '@/src/util/hooks/useOutsideClick';

interface DropdownProps {
    items: {
        key: string;
        children: React.ReactNode;
    }[];
    placeholder: string;
    selected: string;
    renderSelected?: (selected: string) => React.ReactNode;
    maxHeight?: string;
    setSelected: (key: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
    items,
    placeholder,
    selected,
    maxHeight = '200px',
    renderSelected,
    setSelected,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useOutsideClick(dropdownRef, () => setIsOpen(false));

    return (
        <Wrapper ref={dropdownRef}>
            <DropdownButton onClick={() => setIsOpen(!isOpen)}>
                <Stack column gap={'0.5rem'}>
                    <TypoGraphy size={'1.25rem'} weight={300}>
                        {placeholder}
                    </TypoGraphy>
                    <TypoGraphy size={'1.25rem'} weight={400}>
                        {renderSelected ? renderSelected(selected) : selected}
                    </TypoGraphy>
                </Stack>
                <ChevronDown />
            </DropdownButton>
            {isOpen && (
                <DropdownContent maxHeight={maxHeight}>
                    {items &&
                        items.map(({ children, key }) => (
                            <DropdownItem
                                key={key}
                                onClick={() => {
                                    setSelected(key);
                                    setIsOpen(false);
                                }}>
                                {children}
                            </DropdownItem>
                        ))}
                </DropdownContent>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 100%;
    height: auto;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
`;

const DropdownButton = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: ${({ theme }) => theme.background.main};
    border: 1px solid ${({ theme }) => theme.gray(100)};
    font-weight: bold;
    color: ${({ theme }) => theme.gray(900)};
    cursor: pointer;
`;

const DropdownContent = styled.div<{ maxHeight: string }>`
    position: absolute;
    width: 100%;
    top: 110%;
    /* padding: 1.5rem; */
    background-color: ${({ theme }) => theme.background.main};
    border: 1px solid ${({ theme }) => theme.gray(100)};
    z-index: 10;

    max-height: ${({ maxHeight }) => maxHeight};
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    &::-webkit-scrollbar-track {
        background-color: ${({ theme }) => theme.background.main};
    }

    &::-webkit-scrollbar-thumb {
        background-color: ${({ theme }) => theme.gray(100)};
    }
`;

const DropdownItem = styled.div`
    width: 100%;
    &:hover {
        background-color: ${({ theme }) => theme.background.secondary};
    }
    cursor: pointer;
    padding: 1rem;
    transition: all 0.2s;
`;
