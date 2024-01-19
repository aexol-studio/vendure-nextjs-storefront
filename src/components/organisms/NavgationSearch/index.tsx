import React, { useEffect, useRef } from 'react';
import { ArrowRight, SearchIcon, X } from 'lucide-react';
import styled from '@emotion/styled';
import { Link, Stack, TP, TypoGraphy } from '@/src/components/atoms';
import { ProductImageWithInfo } from '../../molecules/ProductImageWithInfo';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigationSearch } from './hooks';
import { PopularSearches } from './PopularSearches';

export const NavigationSearch: React.FC<ReturnType<typeof useNavigationSearch>> = ({
    loading,
    searchQuery,
    searchResults,
    totalItems,
    setSearchQuery,
    closeSearch,
    onSubmit,
}) => {
    const { t } = useTranslation('common');
    const popularSearches = ['Computer', 'Tablet', 'Plant', 'Gloves', 'Mouse'];

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 200);
    }, []);

    return (
        <Stack w100 itemsCenter style={{ position: 'relative' }}>
            <Stack w100 itemsCenter gap="1rem">
                <CrossButton onClick={closeSearch}>
                    <X size="2rem" />
                </CrossButton>
                <Form onSubmit={onSubmit}>
                    <Input
                        onKeyDown={e => e.key === 'Escape' && closeSearch()}
                        ref={inputRef}
                        placeholder={t('search-for-best-products')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        type="text"
                    />
                    <SearchButton type="submit">
                        <SearchIcon size="1.5rem" />
                    </SearchButton>
                </Form>
            </Stack>
            <SearchPosition w100>
                <SearchContent w100>
                    <PopularSearches popularSearches={popularSearches} onClick={item => setSearchQuery(item)}>
                        <TypoGraphy size="2rem" weight={400} noWrap>
                            {t('popular-searches-heading')}
                        </TypoGraphy>
                    </PopularSearches>
                    {searchQuery.length < 3 ? (
                        <TP>{t('search-query-to-short')}</TP>
                    ) : loading ? (
                        <TP>{t('search-results-loading')}</TP>
                    ) : searchResults.length === 0 ? (
                        <TP>
                            <Trans
                                i18nKey="search-results-no-results"
                                values={{ searchQuery }}
                                components={{ 1: <strong></strong> }}
                            />
                        </TP>
                    ) : (
                        <Wrapper column w100 gap={'2rem'}>
                            <Container>
                                <Stack column w100 gap={'2rem'}>
                                    <TypoGraphy size={'2rem'} weight={400}>
                                        {t('search-results-header')}
                                    </TypoGraphy>
                                    <Results w100 flexWrap>
                                        {searchResults.slice(0, 6).map(result => {
                                            return (
                                                <ResultCard gap="0.5rem" itemsCenter column key={result.slug}>
                                                    <ProductImageWithInfo
                                                        size="thumbnail-big"
                                                        imageSrc={result.productAsset?.preview}
                                                        href={`/products/${result.slug}`}
                                                    />
                                                    <Stack itemsCenter column gap="0.5rem">
                                                        <TP size="1.5rem" weight={500}>
                                                            {result.productName}
                                                        </TP>
                                                    </Stack>
                                                </ResultCard>
                                            );
                                        })}
                                    </Results>
                                </Stack>
                            </Container>
                            <StyledLink href={`/search?q=${searchQuery}`}>
                                <Trans
                                    i18nKey="search-results-total"
                                    components={{ 1: <strong></strong> }}
                                    values={{ totalItems, searchQuery }}
                                />
                                <IconWrapper>
                                    <ArrowRight size="1.5rem" />
                                </IconWrapper>
                            </StyledLink>
                        </Wrapper>
                    )}
                </SearchContent>
            </SearchPosition>
        </Stack>
    );
};

const StyledLink = styled(Link)`
    display: flex;
    align-items: center;
    align-self: flex-end;
    gap: 0.5rem;

    width: fit-content;
    color: ${p => p.theme.gray(1000)};
    font-size: 1.5rem;
`;

const Results = styled(Stack)`
    row-gap: 2rem;
    @media (min-width: ${p => p.theme.breakpoints.md}) {
        flex-direction: row;
    }
`;

const ResultCard = styled(Stack)`
    flex-basis: calc(100% / 2);
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        flex-basis: calc(100% / 3);
    }
`;

const SearchPosition = styled(Stack)`
    width: 100%;
    top: calc(100% + 1rem);
    position: absolute;
    z-index: 2136;

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        width: calc(100% + 20rem);
        right: -10rem;
    }
`;

const SearchContent = styled(Stack)`
    position: relative;
    width: 100%;
    min-height: 36rem;
    padding: 3rem 4rem;
    border: 1px solid ${p => p.theme.gray(100)};
    border-radius: ${({ theme }) => theme.borderRadius};
    outline: none;
    font-size: 1.5rem;
    color: ${p => p.theme.gray(1000)};
    background: ${p => p.theme.gray(0)};
    transition: all 0.2s ease-in-out;
    overflow: hidden;

    flex-direction: column;
    gap: 2rem;
    @media (min-width: ${p => p.theme.breakpoints.md}) {
        flex-direction: row;
        justify-content: space-between;
    }
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
    flex-direction: column-reverse;
    gap: 2rem;
    @media (min-width: ${p => p.theme.breakpoints.lg}) {
        flex-direction: row;
        gap: unset;
        justify-content: space-between;
    }
`;

const IconWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    margin-top: 0.25rem;
`;

const Wrapper = styled(Stack)``;
