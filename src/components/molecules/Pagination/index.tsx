import { Stack } from '@/src/components/atoms/Stack';
import { usePagination } from './hooks';
import styled from '@emotion/styled';

export const Pagination: React.FC<{
    page: number;
    changePage: (page: number) => void;
    totalPages: number;
}> = ({ page, changePage, totalPages }) => {
    if (totalPages === 1) return null;
    const { items } = usePagination({ page, totalPages });
    return (
        <PaginationWrapper w100 justifyCenter itemsCenter gap="1rem">
            {totalPages > 1 ? (
                items.map(({ text, page, isCurrent }) => (
                    <PaginationText
                        key={text}
                        onClick={() => {
                            const element = document.getElementById('collection-scroll');
                            element?.scrollIntoView({ behavior: 'smooth' });
                            changePage(page);
                        }}
                        isCurrent={isCurrent}>
                        {text}
                    </PaginationText>
                ))
            ) : (
                <PaginationText isCurrent={true}>1</PaginationText>
            )}
        </PaginationWrapper>
    );
};

const PaginationWrapper = styled(Stack)`
    margin: 3.5rem 0;
`;

const PaginationText = styled.a<{ isCurrent?: boolean }>`
    font-size: 1.5rem;
    font-weight: 500;
    color: ${p => (p.isCurrent ? p.theme.gray(700) : p.theme.gray(500))};
    cursor: pointer;
`;
