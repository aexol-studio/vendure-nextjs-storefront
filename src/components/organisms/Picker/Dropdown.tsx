import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, TypoGraphy } from '@/src/components';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
    items: string[];
    placeholder: string;
    selected: string;
    setSelected: (item: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ items, placeholder, selected, setSelected }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);
    return (
        <Wrapper ref={dropdownRef}>
            <DropdownButton onClick={() => setIsOpen(!isOpen)}>
                <Stack column gap={'0.25rem'}>
                    <TypoGraphy size={'1rem'} weight={100}>
                        {placeholder}
                    </TypoGraphy>
                    <TypoGraphy size={'1rem'} weight={400}>
                        {selected}
                    </TypoGraphy>
                </Stack>
                <ChevronDown />
            </DropdownButton>
            {isOpen && (
                <DropdownContent>
                    {items &&
                        items.map(item => (
                            <DropdownItem
                                key={item}
                                onClick={() => {
                                    setSelected(item);
                                    setIsOpen(false);
                                }}>
                                <TypoGraphy size={'1rem'} weight={400}>
                                    {item}
                                </TypoGraphy>
                            </DropdownItem>
                        ))}
                </DropdownContent>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 100%;
    height: 100px auto;
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
    padding: 1.5rem 2rem;
    background-color: ${({ theme }) => theme.background.main};
    border: 1px solid ${({ theme }) => theme.gray(100)};
    font-weight: bold;
    color: ${({ theme }) => theme.gray(900)};
    cursor: pointer;
`;

const DropdownContent = styled.div`
    position: absolute;
    width: 100%;
    top: 110%;
    /* padding: 1.5rem; */
    background-color: ${({ theme }) => theme.background.main};
    border: 1px solid ${({ theme }) => theme.gray(100)};
    z-index: 10;
`;

const DropdownItem = styled.div`
    cursor: pointer;
    padding: 1rem;
    &:hover {
        background-color: ${({ theme }) => theme.background.secondary};
    }
    transition: all 0.2s;
`;
