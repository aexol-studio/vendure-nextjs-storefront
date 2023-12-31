import { Select, TH2, Stack, SearchInput } from '@/src/components/atoms';
import { IconButton } from '@/src/components/molecules/Button';
import { usePush } from '@/src/lib/redirect';
import styled from '@emotion/styled';
import { Filter, Search } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { CollectionTileType } from '@/src/graphql/selectors';

interface MainBarProps {
    title: string;
    categories: CollectionTileType[];
}

export const MainBar: React.FC<MainBarProps> = ({ title, categories }) => {
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>();
    const [searchPhrase, setSearchPhrase] = useState('');
    const { t } = useTranslation('common');
    const searchParams = useMemo(() => {
        const u = new URLSearchParams();
        if (selectedCategorySlug) u.set('collection', selectedCategorySlug);
        if (searchPhrase) u.set('q', searchPhrase);
        return u.toString();
    }, [selectedCategorySlug, searchPhrase]);
    const push = usePush();
    const searchClick = useCallback(() => {
        if (!searchPhrase) return;
        push(`/search/?${searchParams}`);
    }, [searchPhrase]);
    return (
        <Main w100 itemsCenter justifyBetween gap="2rem">
            <Title>{title}</Title>
            <BarContent itemsCenter gap="2rem">
                <Stack itemsCenter justifyBetween w100 gap="2rem">
                    <Select
                        value={selectedCategorySlug}
                        setValue={e => setSelectedCategorySlug(e)}
                        options={categories.map(c => ({
                            label: c.name,
                            value: c.slug,
                        }))}
                    />{' '}
                    <IconButton>
                        <Filter />
                    </IconButton>
                </Stack>

                <Stack itemsCenter justifyBetween w100 gap="2rem">
                    <SearchInput
                        value={searchPhrase}
                        onChange={e => setSearchPhrase(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                searchClick();
                                return false;
                            }
                        }}
                        placeholder={t('search-products')}
                    />
                    <IconButton
                        onClick={() => {
                            searchClick();
                        }}>
                        <Search />
                    </IconButton>
                </Stack>
            </BarContent>
        </Main>
    );
};

const Title = styled(TH2)`
    flex: 1;
`;

const Main = styled(Stack)`
    @media (max-width: ${p => p.theme.breakpoints.md}) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const BarContent = styled(Stack)`
    @media (max-width: ${p => p.theme.breakpoints.md}) {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
`;
