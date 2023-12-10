import { LogoAexol } from '@/src/assets';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { CollectionTileType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { LanguageSwitcher } from '@/src/components';
import { Select } from '@/src/components/atoms/Select';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'next-i18next';
import { Cart } from '@/src/layouts/Cart';
import { useCart } from '@/src/state/cart';
import { useMemo, useState } from 'react';
import { usePush } from '@/src/lib/redirect';

export const Nav: React.FC<{ categories: CollectionTileType[] }> = ({ categories }) => {
    const { t } = useTranslation('common');
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>();
    const [searchPhrase, setSearchPhrase] = useState('');
    const { cart } = useCart();
    const push = usePush();
    const searchParams = useMemo(() => {
        const u = new URLSearchParams();
        if (selectedCategorySlug) u.set('collection', selectedCategorySlug);
        if (searchPhrase) u.set('q', searchPhrase);
        return u.toString();
    }, [selectedCategorySlug, searchPhrase]);
    return (
        <Main justifyCenter>
            <ContentContainer>
                <Stack itemsCenter justifyBetween>
                    <Stack itemsCenter>
                        <Link href={'/'}>
                            <LogoAexol />
                        </Link>
                    </Stack>
                    <Stack>
                        <Select
                            value={selectedCategorySlug}
                            setValue={e => setSelectedCategorySlug(e)}
                            options={categories.map(c => ({
                                label: c.name,
                                value: c.slug,
                            }))}
                        />
                        <Search
                            value={searchPhrase}
                            onChange={e => setSearchPhrase(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    if (!searchPhrase) return;
                                    push(`/search/?${searchParams}`);
                                    return false;
                                }
                            }}
                            placeholder={t('search-products')}
                        />
                    </Stack>
                    <LanguageSwitcher />
                    <Cart activeOrder={cart} />
                </Stack>
            </ContentContainer>
        </Main>
    );
};
const Main = styled(Stack)`
    width: 100%;
    padding: 2rem;
    position: sticky;
    top: 0;
    background: ${p => p.theme.gray(0)};
    z-index: 1;
    border-bottom: 1px solid ${p => p.theme.gray(100)};
    svg {
        max-height: 4rem;
    }
`;
const Search = styled.input`
    background: ${p => p.theme.accent(50)};
    border: 0;
    border-top-right-radius: ${p => p.theme.borderRadius};
    border-bottom-right-radius: ${p => p.theme.borderRadius};
    font-size: 1.25rem;
    padding: 0.5rem 2rem 0.5rem 1rem;
    max-width: 100%;
    min-width: 30rem;
`;
