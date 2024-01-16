import { Link, Stack, TH1, TH2, TP } from '@/src/components/atoms';
import { thv } from '@/src/theme';
import { optimizeImage } from '@/src/util/optimizeImage';
import styled from '@emotion/styled';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC<{
    h1: string;
    h2: string;
    desc: string;
    cta: string;
    image: string;
    link: string;
}> = ({ cta, desc, h1, h2, image, link }) => {
    return (
        <Main column justifyCenter>
            <Content>
                <TextWrapper column gap="2rem">
                    <Stack column gap="1rem">
                        <Stack column>
                            <TH1 weight={600}>{h1}</TH1>
                            <TH2 weight={400} color="subtitle">
                                {h2}
                            </TH2>
                        </Stack>
                        <TP size="1.75rem" color="subtitle" weight={500}>
                            {desc}
                        </TP>
                    </Stack>
                    <StandAloneLink href={link}>
                        {cta}
                        <ArrowRight size="2rem" />
                    </StandAloneLink>
                </TextWrapper>
                <HeroImage
                    fetchPriority="high"
                    src={optimizeImage({
                        size: { width: 700, height: 500, format: 'webp', mode: 'resize' },
                        src: image,
                    })}
                    alt="Aexol shop demo"
                    title="Aexol shop demo"
                />
            </Content>
        </Main>
    );
};

const TextWrapper = styled(Stack)`
    margin-top: 1.5rem;
    @media (min-width: ${p => p.theme.breakpoints.md}) {
        margin-top: 0;
    }
`;

const Content = styled(Stack)`
    width: 100%;
    max-width: 1280px;
    padding: 0;
    flex-direction: column-reverse;

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        margin: 0 auto;
        gap: 4rem;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    @media (max-width: 1560px) {
        max-width: 1440px;
        padding: 0 4rem;
    }
`;

const StandAloneLink = styled(Link)`
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 1rem;

    color: ${thv.text.main};
    font-weight: 600;
    text-transform: uppercase;
`;

const Main = styled(Stack)`
    width: 100%;
    background: ${p => p.theme.background.ice};
    padding: 4.5rem 0;
`;

const HeroImage = styled.img`
    object-fit: cover;
    width: 100%;
    max-width: 100%;
    max-height: 36rem;

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        max-width: 42rem;
        max-height: 32rem;
    }

    @media (min-width: ${p => p.theme.breakpoints.lg}) {
        max-width: 45rem;
        max-height: 24rem;
    }
`;
