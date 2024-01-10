import { ContentContainer, Link, Stack, TH1, TH2, TP } from '@/src/components/atoms';
import { Button } from '@/src/components/molecules/Button';
import { thv } from '@/src/theme';
import styled from '@emotion/styled';

export const Hero: React.FC<{
    h1: string;
    h2: string;
    desc: string;
    cta: string;
    image: string;
    link: string;
}> = ({ cta, desc, h1, h2, image, link }) => {
    return (
        <Main justifyCenter>
            <ContentContainer>
                <Content justifyBetween>
                    <Stack column gap="4rem">
                        <Stack column gap="1rem">
                            <TH1>{h1}</TH1>
                            <TH2>{h2}</TH2>
                            <TP>{desc}</TP>
                        </Stack>
                        <Link href={link}>
                            <Button>{cta}</Button>
                        </Link>
                    </Stack>
                    <HeroImage src={image} alt="Aexol shop demo" title="Aexol shop demo" />
                </Content>
            </ContentContainer>
        </Main>
    );
};

const Content = styled(Stack)`
    @media (max-width: ${p => p.theme.breakpoints.sm}) {
        flex-direction: column-reverse;
    }
`;

const Main = styled(Stack)`
    width: 100%;
    background: ${thv.background.third};
    padding: 15rem 0 20rem 0;
`;
const HeroImage = styled.img`
    aspect-ratio: 2.2;
    object-fit: cover;
    height: 24rem;
`;
