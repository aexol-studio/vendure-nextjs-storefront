import styled from '@emotion/styled';
import { Stack, TypoGraphy } from '@/src/components';
import { PropsWithChildren } from 'react';

interface PopularSearchesProps extends PropsWithChildren {
    popularSearches: string[];
    onClick: (item: string) => void;
}

export const PopularSearches: React.FC<PopularSearchesProps> = ({ children, popularSearches, onClick }) => {
    return (
        <Stack column gap="1rem">
            {children}
            <PopularSearchesWrapper gap="1rem">
                {popularSearches &&
                    popularSearches.map(item => (
                        <TypoGraphy
                            key={item}
                            size={'1.5rem'}
                            weight={400}
                            onClick={() => onClick(item)}
                            style={{ cursor: 'pointer' }}>
                            {item}
                        </TypoGraphy>
                    ))}
            </PopularSearchesWrapper>
        </Stack>
    );
};

const PopularSearchesWrapper = styled(Stack)`
    flex-direction: row;

    @media (min-width: ${p => p.theme.breakpoints.lg}) {
        flex-direction: column;
    }
`;
