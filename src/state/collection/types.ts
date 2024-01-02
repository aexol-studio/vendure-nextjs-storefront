import { CollectionType, ProductSearchType, FiltersFacetType } from '@/src/graphql/selectors';
import { SortOrder } from '@/src/zeus';

export type PaginationInfoType = {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    itemsPerPage: number;
};

export type Sort = {
    key: string;
    direction: SortOrder;
};

export type CollectionContainerType = {
    searchPhrase: string;
    collection?: CollectionType;
    products?: ProductSearchType[];
    facetValues?: FiltersFacetType[];
    paginationInfo: PaginationInfoType;
    changePage: (page: number) => void;
    filtersOpen: boolean;
    setFiltersOpen: (open: boolean) => void;
    filters: { [key: string]: string[] };
    applyFilter: (group: { id: string; name: string }, value: { id: string; name: string }) => Promise<void>;
    removeFilter: (group: { id: string; name: string }, value: { id: string; name: string }) => Promise<void>;
    sort: Sort;
    handleSort: (sort: Sort) => Promise<void>;
};
