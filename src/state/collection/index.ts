import { useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { CollectionType, FiltersFacetType, ProductSearchType, SearchSelector } from '@/src/graphql/selectors';
import { GraphQLTypes, SortOrder } from '@/src/zeus';
import { storefrontApiQuery } from '@/src/graphql/client';
import { useRouter } from 'next/router';
import { PER_PAGE, collectionsEmptyState, prepareFilters, reduceFacets } from './utils';
import { CollectionContainerType, Sort } from './types';
import { useChannels } from '../channels';

const useCollectionContainer = createContainer<
    CollectionContainerType,
    {
        collection: CollectionType;
        products: ProductSearchType[];
        totalProducts: number;
        facets: FiltersFacetType[];
        searchQuery?: string;
        filters?: { [key: string]: string[] };
        sort?: Sort;
        page?: number;
    }
>(initialState => {
    if (!initialState?.collection) return collectionsEmptyState;
    const ctx = useChannels();
    const [collection, setCollection] = useState(initialState.collection);
    const [products, setProducts] = useState(initialState.products);
    const [totalProducts, setTotalProducts] = useState(initialState.totalProducts);
    const [facetValues, setFacetValues] = useState(initialState.facets);
    const [filters, setFilters] = useState<{ [key: string]: string[] }>(
        initialState.filters ? initialState.filters : {},
    );
    const initialSort = initialState.sort ? initialState.sort : { key: 'title', direction: SortOrder.ASC };
    const [sort, setSort] = useState<{
        key: string;
        direction: SortOrder;
    }>(initialSort);
    const [currentPage, setCurrentPage] = useState(initialState.page ? initialState.page : 1);
    const [q, setQ] = useState<string | undefined>(initialState.searchQuery ? initialState.searchQuery : undefined);
    const { query } = useRouter();

    useEffect(() => {
        setProducts(initialState.products);
        setTotalProducts(initialState.totalProducts);
        setFacetValues(initialState.facets);
        setCollection(initialState.collection);
        setFilters({});
    }, [initialState]);

    const [filtersOpen, setFiltersOpen] = useState(false);

    const totalPages = useMemo(() => Math.ceil(totalProducts / PER_PAGE), [totalProducts]);

    useEffect(() => {
        if (initialState.searchQuery) return;
        if (query.page) setCurrentPage(parseInt(query.page as string));
        if (query.sort) {
            const [key, direction] = (query.sort as string).split('-');
            setSort({ key, direction: direction.toUpperCase() as SortOrder });
        }
        if (query.q) setQ(query.q as string);
        if (query && Object.keys(query).filter(k => k !== 'slug' && k !== 'locale' && k !== 'channel').length) {
            const filters = prepareFilters(query, initialState.facets);
            let q = undefined;
            let sort = { key: 'title', direction: SortOrder.ASC };
            if (query.q) q = query.q as string;
            if (query.sort) {
                const [key, direction] = (query.sort as string).split('-');
                sort = { key, direction: direction.toUpperCase() as SortOrder };
            }
            setFilters(filters);
            getFilteredProducts(filters, query.page ? parseInt(query.page as string) : 1, sort, q);
        }
    }, [query]);

    const handleSort = async (sort: Sort) => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort', `${sort.key}-${sort.direction}`.toLowerCase());
        window.history.pushState({}, '', url.toString());
        setSort(sort);
        await getFilteredProducts(filters, 1, sort, q);
    };

    const changePage = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        window.history.pushState({}, '', url.toString());
        setCurrentPage(page);
        getFilteredProducts(filters, page, sort, q);
    };

    const applyFilter = async (group: { id: string; name: string }, value: { id: string; name: string }) => {
        const newState = { ...filters, [group.id]: [...(filters[group.id] || []), value.id] };

        const url = new URL(window.location.href);
        if (url.searchParams.get(group.name)) {
            url.searchParams.set(group.name, `${url.searchParams.get(group.name)},${value.name}`);
        } else url.searchParams.set(group.name, value.name);

        setFilters(newState);
        url.searchParams.set('page', '1');
        await getFilteredProducts(newState, 1, sort, q);
        window.history.pushState({}, '', url.toString());
    };

    const removeFilter = async (group: { id: string; name: string }, value: { id: string; name: string }) => {
        const newState = { ...filters, [group.id]: filters[group.id].filter(f => f !== value.id) };

        const url = new URL(window.location.href);
        if (url.searchParams.get(group.name)) {
            const values = url.searchParams.get(group.name)?.split(',');
            const filtered = values?.filter(v => v !== value.name);
            if (filtered?.length) url.searchParams.set(group.name, filtered.join(','));
            else url.searchParams.delete(group.name);
        }

        setFilters(newState);
        url.searchParams.set('page', '1');
        await getFilteredProducts(newState, 1, sort, q);
        window.history.pushState({}, '', url.toString());
    };

    const getFilteredProducts = async (state: { [key: string]: string[] }, page: number, sort: Sort, q?: string) => {
        if (page < 1) page = 1;
        const facetValueFilters: GraphQLTypes['FacetValueFilterInput'][] = [];

        Object.entries(state).forEach(([key, value]) => {
            const facet = initialState.facets.find(f => f.id === key);
            if (!facet) return;
            const filter: GraphQLTypes['FacetValueFilterInput'] = {};
            if (value.length === 1) filter.and = value[0];
            else filter.or = value;
            facetValueFilters.push(filter);
        });

        const input: GraphQLTypes['SearchInput'] = {
            collectionSlug: collection.slug,
            groupByProduct: true,
            facetValueFilters,
            take: PER_PAGE,
            skip: PER_PAGE * (page - 1),
            sort: sort.key === 'title' ? { name: sort.direction } : { price: sort.direction },
            term: q,
        };

        const { search } = await storefrontApiQuery(ctx)({
            search: [{ input }, SearchSelector],
        });

        setProducts(search?.items);
        setTotalProducts(search?.totalItems);
        const facets = reduceFacets(search?.facetValues || []);
        setFacetValues(facets);
    };

    return {
        searchPhrase: q || '',
        collection,
        products,
        facetValues,
        sort,
        handleSort,
        paginationInfo: {
            currentPage,
            totalPages,
            totalProducts,
            itemsPerPage: PER_PAGE,
        },
        changePage,
        filtersOpen,
        setFiltersOpen,
        filters,
        applyFilter,
        removeFilter,
    };
});

export const useCollection = useCollectionContainer.useContainer;
export const CollectionProvider = useCollectionContainer.Provider;
