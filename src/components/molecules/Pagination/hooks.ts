export const usePagination = ({ page, totalPages }: { page: number; totalPages: number }) => {
    const paginationArray: {
        page: number;
        isCurrent?: boolean;
        text: string;
    }[] = [];
    const maxVisiblePages = 5;

    const addPageLink = (pageNumber: number) =>
        paginationArray.push({
            text: pageNumber.toString(),
            page: pageNumber,
            isCurrent: pageNumber === page,
        });

    if (page > 1) {
        paginationArray.push({ text: '<<', page: 1 });
        paginationArray.push({ text: '<', page: page - 1 });
    }

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) addPageLink(i);
    } else {
        const firstIndex = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        const lastIndex = Math.min(totalPages, firstIndex + maxVisiblePages - 1);

        for (let i = firstIndex; i <= lastIndex; i++) {
            addPageLink(i);
        }
    }

    if (page < totalPages) {
        paginationArray.push({ text: '>', page: page + 1 });
        paginationArray.push({ text: '>>', page: totalPages });
    }

    return { items: paginationArray };
};
