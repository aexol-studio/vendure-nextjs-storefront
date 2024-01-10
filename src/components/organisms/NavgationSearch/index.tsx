import React, { useRef, useEffect, useState } from 'react';
import { SearchIcon, X } from 'lucide-react';
import styled from '@emotion/styled';
import { Link, Stack, TP, TypoGraphy } from '@/src/components/atoms';
import { storefrontApiQuery } from '@/src/graphql/client';
import { ProductSearchType, ProductSearchSelector } from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import { useRouter } from 'next/router';
import { ProductImageWithInfo } from '../../molecules/ProductImageWithInfo';
import { Slider } from '../Slider';
import { SortOrder } from '@/src/zeus';
import { useTranslation, Trans } from 'react-i18next';
import { Chevron } from '@/src/assets';

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
    const { t } = useTranslation('common');
    const push = usePush();
    const language = query?.locale as string;
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(query.q ? query.q.toString() : '');
    const [searchResults, setSearchResult] = useState<ProductSearchType[]>([]);
    const debouncedSearch = useDebounce(searchQuery, 200);
    const [mostWanted, setMostWanted] = useState<ProductSearchType[]>([]);
    const [totalItems, setTotalItems] = useState(0);

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
                        {
                            input: {
                                term: debouncedSearch,
                                take: 8,
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

    useEffect(() => {
        const getBestOf = async () => {
            try {
                const bestOf = await storefrontApiQuery(language)({
                    search: [
                        { input: { take: 2, groupByProduct: false, sort: { name: SortOrder.DESC }, inStock: true } },
                        { items: ProductSearchSelector },
                    ],
                });
                setMostWanted(bestOf.search.items);
            } catch (error) {
                console.error(error);
            }
        };
        getBestOf();
    }, []);

    const slides = searchResults.map(result => (
        <ProductImageWithInfo
            key={result.slug}
            size="thumbnail-big"
            imageSrc={result.productAsset?.preview}
            href={`/products/${result.slug}`}
            text={result.productName}
        />
    ));

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
                            <Wrapper column w100 gap={'2rem'}>
                                <Container>
                                    <MaxWidth>
                                        <Stack column gap={'2rem'}>
                                            <TypoGraphy size={'2rem'} weight={400}>
                                                {t('search-results-header')}
                                            </TypoGraphy>
                                            <Slider slides={slides} withArrows spacing={16} />
                                        </Stack>
                                    </MaxWidth>
                                    <Divider />
                                    <Stack column gap={'1.5rem'}>
                                        <TypoGraphy size={'2rem'} weight={400}>
                                            Most Wanted
                                        </TypoGraphy>
                                        <MostWanted>
                                            {mostWanted.map(product => (
                                                <Stack column key={product.slug} gap={'0.5rem'}>
                                                    <ProductImageWithInfo
                                                        size="thumbnail"
                                                        imageSrc={product.productAsset?.preview}
                                                        href={`/products/${product.slug}`}
                                                    />
                                                    <Link href={`/products/${product.slug}`}></Link>
                                                    <TypoGraphy
                                                        style={{ textAlign: 'center' }}
                                                        size={'1rem'}
                                                        weight={400}>
                                                        {product.productName}
                                                    </TypoGraphy>
                                                </Stack>
                                            ))}
                                        </MostWanted>
                                    </Stack>
                                </Container>
                                <TotalResults
                                    onClick={() => {
                                        push(`/search?q=${searchQuery}`);
                                    }}>
                                    <Trans i18nKey="search-results-total" values={{ totalItems, searchQuery }} />
                                    <IconWrapper>
                                        <Chevron />
                                    </IconWrapper>
                                </TotalResults>
                            </Wrapper>
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
    overflow: hidden;
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

const Container = styled(Stack)`
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 2rem;
    @media (min-width: ${p => p.theme.breakpoints.lg}) {
        flex-direction: row;
        gap: unset;
        justify-content: space-between;
        align-items: center;
    }
`;

const MostWanted = styled(Stack)`
    flex-direction: row;
    gap: 2rem;
`;

const MaxWidth = styled.div`
    max-width: 32rem;
`;

const TotalResults = styled(Stack)`
    align-items: center;
    cursor: pointer;
    gap: 0.5rem;
    svg {
        width: 0.8rem;
        transform: rotate(-90deg);
    }
`;

const IconWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled(Stack)``;

const Divider = styled.div`
    display: none;
    @media (min-width: ${p => p.theme.breakpoints.md}) {
        display: block;
    }
    height: 100%;
    width: 1px;
    background-color: ${p => p.theme.gray(100)};
`;
