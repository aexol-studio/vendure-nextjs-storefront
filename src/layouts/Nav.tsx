import { LogoAexol } from '@/src/assets';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { CollectionTileType } from '@/src/graphql/selectors';
import styled from '@emotion/styled';
import { LanguageSwitcher } from '@/src/components';
import { Select } from '@/src/components/atoms/Select';
import { Link } from '@/src/components/atoms/Link';
import { useTranslation } from 'react-i18next';
import { Cart } from '@/src/layouts/Cart';
import { useCart } from '@/src/state/cart';

export const Nav: React.FC<{ categories: CollectionTileType[] }> = ({ categories }) => {
    const { t } = useTranslation('common');
    const { cart } = useCart();
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
                            options={categories.map(c => ({
                                label: c.name,
                                value: c.id,
                            }))}
                        />
                        <Search placeholder={t('search-products')} />
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
    position: fixed;
    background: ${p => p.theme.gray(0)};
    z-index: 1;
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
