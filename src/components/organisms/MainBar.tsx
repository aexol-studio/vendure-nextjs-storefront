import { TH2, Stack, SearchInput } from '@/src/components/atoms';
import { IconButton } from '@/src/components/molecules/Button';
import { usePush } from '@/src/lib/redirect';
import styled from '@emotion/styled';
import { Search } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { CollectionTileType } from '@/src/graphql/selectors';
import { useRouter } from 'next/router';

interface MainBarProps {
    title: string;
    categories: CollectionTileType[];
}

export const MainBar: React.FC<MainBarProps> = ({ title }) => {
    const { t } = useTranslation('common');
    const { query } = useRouter();
    const push = usePush();

    const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const q = e.currentTarget.elements.namedItem('q') as HTMLInputElement;
        if (!q.value) return;
        push(`/search?q=${q.value}`);
    };

    return (
        <Main w100 itemsCenter justifyBetween gap="2rem">
            <Title>{title}</Title>
            <BarContent itemsCenter gap="2rem">
                <SearchForm onSubmit={onSearch}>
                    <SearchInput value={query.q as string} name="q" placeholder={t('search-products')} />
                    <IconButton type="submit">
                        <Search />
                    </IconButton>
                </SearchForm>
            </BarContent>
        </Main>
    );
};

const SearchForm = styled.form`
    width: 100%;
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: center;
`;

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
