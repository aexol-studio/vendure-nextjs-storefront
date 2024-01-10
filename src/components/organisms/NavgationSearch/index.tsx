import React, { useRef, useEffect, useState } from 'react';
import { SearchIcon, X } from 'lucide-react';
import styled from '@emotion/styled';
import { Link, Stack, TP } from '@/src/components/atoms';
import { storefrontApiQuery } from '@/src/graphql/client';
import { ProductSearchType, ProductSearchSelector } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import { useRouter } from 'next/router';
import { ProductImageWithInfo } from '../../molecules/ProductImageWithInfo';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export const NavigationSearch: React.FC<{ searchOpen: boolean; toggleSearch: () => void }> = ({ toggleSearch }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { query } = useRouter();

    const push = usePush();
    const language = query?.locale as string;

    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(query.q ? query.q.toString() : '');
    const [searchResults, setSearchResult] = useState<ProductSearchType[]>([]);
    const debouncedSearch = useDebounce(searchQuery, 200);

    const handleSearch = () => {
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
                const results = await storefrontApiQuery(language)({
                    search: [
                        { input: { term: debouncedSearch, take: 8, groupByProduct: true } },
                        { items: ProductSearchSelector, totalItems: true },
                    ],
                });
                setSearchResult(results.search.items);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setSearchResult([]);
                setLoading(false);
            }
        };

        getResults();
    }, [debouncedSearch]);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 200);
    }, []);

    return (
        <Stack w100 itemsCenter style={{ position: 'relative' }}>
            <Stack w100 itemsCenter gap="1rem">
                <CrossButton onClick={handleSearch}>
                    <X size="2rem" />
                </CrossButton>
                <Form onSubmit={onSubmit}>
                    <Input
                        ref={inputRef}
                        placeholder="Search for best products"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        type="text"
                    />
                    <SearchButton type="submit">
                        <SearchIcon size="1.5rem" />
                    </SearchButton>
                </Form>
            </Stack>
            {searchQuery.length > 0 ? (
                <SearchPosition w100>
                    <SearchContent w100>
                        {debouncedSearch.length < 3 ? (
                            <TP>Search query must be at least 3 characters long</TP>
                        ) : loading ? (
                            <TP>Loading...</TP>
                        ) : searchResults.length === 0 ? (
                            <TP>
                                No results for <strong>{debouncedSearch}</strong>
                            </TP>
                        ) : (
                            searchResults.map(result => (
                                <Stack justifyCenter gap="0.5rem" column w100 key={result.slug}>
                                    <ProductImageWithInfo
                                        href={`/products/${result.slug}`}
                                        size="thumbnail-big"
                                        imageSrc={result.productAsset?.preview}
                                    />
                                    <Link href={`/products/${result.slug}`}></Link>
                                    <TP>{result.productName}</TP>
                                </Stack>
                            ))
                        )}
                    </SearchContent>
                </SearchPosition>
            ) : null}
        </Stack>
    );
};

const SearchPosition = styled(Stack)`
    width: calc(100% - 3rem);
    top: calc(100% + 1rem);
    position: absolute;
    right: 0;
    z-index: 2137;
`;

const SearchContent = styled(Stack)`
    position: relative;
    width: 100%;
    padding: 1rem 2rem;
    border: 1px solid ${p => p.theme.gray(100)};
    border-radius: ${({ theme }) => theme.borderRadius};
    outline: none;
    font-size: 1.5rem;
    color: ${p => p.theme.gray(1000)};
    background: ${p => p.theme.gray(0)};
    transition: all 0.2s ease-in-out;
`;

const Form = styled.form`
    width: 100%;
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;
`;

const Input = styled.input`
    width: 100%;
    padding: 1rem 2rem;
    border: 1px solid ${p => p.theme.gray(100)};
    border-radius: ${({ theme }) => theme.borderRadius};
    outline: none;
    font-size: 1.5rem;
    color: ${p => p.theme.gray(1000)};
    background: ${p => p.theme.gray(0)};
    transition: all 0.2s ease-in-out;
`;

const CrossButton = styled.button`
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    margin: 0;
`;

const SearchButton = styled.button`
    position: absolute;
    right: 1.5rem;
    height: 100%;

    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    margin: 0;
`;
