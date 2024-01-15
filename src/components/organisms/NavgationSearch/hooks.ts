import { storefrontApiQuery } from '@/src/graphql/client';
import { ProductSearchSelector, ProductSearchType } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import { useChannels } from '@/src/state/channels';
import { useDebounce } from '@/src/util/hooks/useDebounce';
import { SortOrder } from '@/src/zeus';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useNavigationSearch = () => {
    const ctx = useChannels();
    const { query, asPath } = useRouter();
    const push = usePush();

    const [searchOpen, setSearchOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(query.q ? query.q.toString() : '');
    const [searchResults, setSearchResult] = useState<ProductSearchType[]>([]);
    const debouncedSearch = useDebounce(searchQuery, 200);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        if (!searchOpen) return;
        setSearchOpen(false);
    }, [asPath]);

    const toggleSearch = () => setSearchOpen(prev => !prev);
    const closeSearch = () => {
        toggleSearch();
        setSearchQuery('');
        setSearchResult([]);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.length < 3) return;
        push(`/search?q=${searchQuery}`);
    };

    useEffect(() => {
        if (!debouncedSearch || debouncedSearch.length < 3) {
            setSearchResult([]);
            return;
        }

        const getResults = async () => {
            try {
                setLoading(true);
                const results = await storefrontApiQuery(ctx)({
                    search: [
                        {
                            input: {
                                term: debouncedSearch,
                                take: 6,
                                groupByProduct: true,
                                sort: { price: SortOrder.DESC },
                            },
                        },
                        { items: ProductSearchSelector, totalItems: true },
                    ],
                });
                setSearchResult(results.search.items);
                setLoading(false);
                setTotalItems(results.search.totalItems);
            } catch (error) {
                console.log(error);
                setSearchResult([]);
                setLoading(false);
            }
        };

        getResults();
    }, [debouncedSearch]);

    return {
        searchOpen,
        toggleSearch,
        loading,
        searchQuery,
        searchResults,
        totalItems,
        setSearchQuery,
        closeSearch,
        onSubmit,
    };
};
