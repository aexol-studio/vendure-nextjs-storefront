import { useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { CollectionType, FiltersFacetType, ProductSearchType, SearchSelector } from '@/src/graphql/selectors';
import { GraphQLTypes } from '@/src/zeus';
import { storefrontApiQuery } from '@/src/graphql/client';
import { useRouter } from 'next/router';
import { PER_PAGE, collectionsEmptyState, reduceFacets } from './utils';
import { CollectionContainerType } from './types';

const useCollectionContainer = createContainer<
    CollectionContainerType,
    { collection: CollectionType; products: ProductSearchType[]; totalProducts: number; facets: FiltersFacetType[] }
>(initialState => {
    if (!initialState?.collection || !initialState?.products) return collectionsEmptyState;
    const [collection] = useState(initialState.collection);
    const [products, setProducts] = useState(initialState.products);
    const [totalProducts, setTotalProducts] = useState(initialState.totalProducts);
    const [facetValues, setFacetValues] = useState(initialState.facets);

    const [filters, setFilters] = useState<{ [key: string]: string[] }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { query } = useRouter();

    const totalPages = useMemo(() => Math.ceil(totalProducts / PER_PAGE), [totalProducts]);

    useEffect(() => {
        if (query.page) setCurrentPage(parseInt(query.page as string));
        if (query && Object.keys(query).filter(k => k !== 'slug' && k !== 'locale').length) {
            const filters: { [key: string]: string[] } = {};
            Object.entries(query).forEach(([key, value]) => {
                if (key === 'slug' || key === 'locale' || key === 'page' || !value) return;
                const facetGroup = initialState.facets.find(f => f.name === key);
                if (!facetGroup) return;
                const facet = facetGroup.values.find(v => v.name === value);
                if (!facet) return;
                filters[facetGroup.id] = [...(filters[facetGroup.id] || []), facet.id];
            });
            setFilters(filters);
            getFilteredProducts(filters, query.page ? parseInt(query.page as string) : 1);
        }
    }, [query]);

    const changePage = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        window.history.pushState({}, '', url.toString());
        setCurrentPage(page);
        getFilteredProducts(filters, page);
    };

    const applyFilter = async (group: { id: string; name: string }, value: { id: string; name: string }) => {
        const newState = { ...filters, [group.id]: [...(filters[group.id] || []), value.id] };

        const url = new URL(window.location.href);
        if (url.searchParams.get(group.name)) {
            url.searchParams.set(group.name, `${url.searchParams.get(group.name)},${value.name}`);
        } else url.searchParams.set(group.name, value.name);

        setFilters(newState);
        url.searchParams.set('page', '1');
        await getFilteredProducts(newState, 1);
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
        await getFilteredProducts(newState, 1);
        window.history.pushState({}, '', url.toString());
    };

    const getFilteredProducts = async (state: { [key: string]: string[] }, page: number) => {
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
            take: PER_PAGE * page,
            skip: PER_PAGE * (page - 1),
        };

        const { search } = await storefrontApiQuery({
            search: [{ input }, SearchSelector],
        });

        setProducts(search?.items);
        setTotalProducts(search?.totalItems);
        const facets = reduceFacets(search?.facetValues || []);
        setFacetValues(facets);
    };

    return {
        collection,
        products,
        facetValues,
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
