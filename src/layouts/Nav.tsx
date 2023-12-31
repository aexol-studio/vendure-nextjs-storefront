import { LogoAexol } from '@/src/assets';
import { ContentContainer, ProductImage } from '@/src/components/atoms';
import { UserMenu } from '@/src/components/molecules/UserMenu';

import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { LanguageSwitcher } from '@/src/components';
import { Link } from '@/src/components/atoms/Link';
import { useCart } from '@/src/state/cart';
import { User2 } from 'lucide-react';

// import { Cart } from '@/src/layouts/Cart';
import { CartDrawer } from '@/src/layouts/CartDrawer';
import { CollectionTileType } from '../graphql/selectors';
import { RootNode } from '../util/arrayToTree';

interface NavProps {
    navigation: RootNode<CollectionTileType> | null;
}

export const Nav: React.FC<NavProps> = ({ navigation }) => {
    const { isLogged, cart } = useCart();

    return (
        <Main justifyCenter>
            <ContentContainer>
                <Stack itemsCenter justifyBetween>
                    <Stack itemsCenter>
                        <Link href={'/'}>
                            <LogoAexol />
                        </Link>
                    </Stack>
                    <DesktopStack itemsCenter gap="10rem">
                        {navigation?.children.map(c => {
                            if (c.children.length === 0) {
                                return (
                                    <Stack key={c.name}>
                                        <StyledLink href={`/collections/${c.slug}`}>{c.name}</StyledLink>
                                    </Stack>
                                );
                            }
                            return (
                                <RelativeStack w100 key={c.name}>
                                    <StyledLink href={`/collections/${c.slug}`}>{c.name}</StyledLink>
                                    <AbsoluteStack w100>
                                        <ContentContainer>
                                            <Background w100 justifyBetween>
                                                <Stack column>
                                                    {c.children.map(cc => (
                                                        <Stack key={cc.name + '1'}>
                                                            <StyledLink href={`/collections/${cc.slug}`}>
                                                                {cc.name}
                                                            </StyledLink>
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                                <Stack>
                                                    {c.children.map(cc => (
                                                        <Stack key={cc.name + '2'}>
                                                            <ProductImage
                                                                src={cc.featuredAsset?.preview || ''}
                                                                size="tile"
                                                            />
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Background>
                                        </ContentContainer>
                                    </AbsoluteStack>
                                </RelativeStack>
                            );
                        })}
                    </DesktopStack>
                    <Stack gap="1rem" itemsCenter>
                        <LanguageSwitcher />
                        {isLogged ? (
                            <UserMenu />
                        ) : (
                            <StyledLink href="/customer/sign-in">
                                <User2 size="2.4rem" />
                            </StyledLink>
                        )}
                        {/* <Cart activeOrder={cart} /> */}
                        <CartDrawer activeOrder={cart} />
                    </Stack>
                </Stack>
            </ContentContainer>
        </Main>
    );
};

const DesktopStack = styled(Stack)`
    @media (max-width: ${p => p.theme.breakpoints.xl}) {
        display: none;
    }
`;

const Background = styled(Stack)`
    height: 100%;
    background: ${p => p.theme.gray(0)};
    box-shadow: 0.1rem 0.25rem 0.2rem ${p => p.theme.shadow};
    border: 1px solid ${p => p.theme.gray(100)};

    margin-top: 3.2rem;
    padding: 2rem 2rem 2rem 2rem;
`;

const RelativeStack = styled(Stack)`
    & > div {
        opacity: 0;
        visibility: hidden;
    }

    &:hover {
        & > div {
            opacity: 1;
            visibility: visible;
        }
    }
`;

const AbsoluteStack = styled(Stack)`
    position: absolute;
    top: 0;
    right: 0;
    margin-top: 5rem;
    transition: opacity 0.35s ease-in-out;

    :hover {
        opacity: 1;
        visibility: visible;
    }
`;

const StyledLink = styled(Link)`
    color: ${p => p.theme.text.main};

    text-transform: uppercase;
    font-weight: 700;
    font-size: 1.2rem;
    white-space: nowrap;
`;

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
