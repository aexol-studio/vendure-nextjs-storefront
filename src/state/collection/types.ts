import { CollectionType, ProductSearchType, FiltersFacetType } from '@/src/graphql/selectors';

export type PaginationInfoType = {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    itemsPerPage: number;
};

export type CollectionContainerType = {
    collection?: CollectionType;
    products?: ProductSearchType[];
    facetValues?: FiltersFacetType[];
    paginationInfo: PaginationInfoType;
    changePage: (page: number) => void;
    filtersOpen: boolean;
    setFiltersOpen: (open: boolean) => void;
    filters: { [key: string]: string[] };
    applyFilter: (group: { id: string; name: string }, value: { id: string; name: string }) => void;
    removeFilter: (group: { id: string; name: string }, value: { id: string; name: string }) => void;
};
