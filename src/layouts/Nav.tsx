import { LogoAexol } from '@/src/assets';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { LanguageSwitcher } from '@/src/components';
import { Link } from '@/src/components/atoms/Link';
import { Cart } from '@/src/layouts/Cart';
import { useCart } from '@/src/state/cart';
// import { User2 } from 'lucide-react';

export const Nav: React.FC = () => {
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
                    <LanguageSwitcher />
                    {/* <Link href={cart?.customer ? '/customer/manage' : '/customer/sign-in'}>
                        <User2 color="#000" />
                    </Link> */}
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
