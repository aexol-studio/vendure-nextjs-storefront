import { SearchType, FiltersFacetType } from '@/src/graphql/selectors';
import { CollectionContainerType } from './types';
import { SortOrder } from '@/src/zeus';

export const collectionsEmptyState: CollectionContainerType = {
    searchPhrase: '',
    collection: undefined,
    products: undefined,
    facetValues: undefined,
    paginationInfo: {
        currentPage: 0,
        totalPages: 0,
        totalProducts: 0,
        itemsPerPage: 0,
    },
    changePage: () => {},
    filtersOpen: false,
    setFiltersOpen: () => {},
    filters: {},
    applyFilter: async () => {},
    removeFilter: async () => {},
    handleSort: async () => {},
    sort: {
        key: 'title',
        direction: SortOrder.ASC,
    },
};

export const PER_PAGE = 24;

export const sortOptions = [
    {
        key: 'title',
        direction: SortOrder.ASC,
    },
    {
        key: 'title',
        direction: SortOrder.DESC,
    },
    {
        key: 'price',
        direction: SortOrder.ASC,
    },
    {
        key: 'price',
        direction: SortOrder.DESC,
    },
] as const;

export const reduceFacets = (facetValues: SearchType['facetValues']): FiltersFacetType[] => {
    return facetValues.reduce((acc, curr) => {
        const facet = curr.facetValue.facet;
        const facetValue = {
            ...curr.facetValue,
            count: curr.count,
        };
        const facetGroup = acc.find(f => f.name === facet.name);
        if (facetGroup) {
            facetGroup.values.push(facetValue);
        } else {
            acc.push({ id: facet.id, name: facet.name, code: facet.code, values: [facetValue] });
        }
        return acc;
    }, [] as FiltersFacetType[]);
};
