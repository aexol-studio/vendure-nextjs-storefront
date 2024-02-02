import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import { Stack, TypoGraphy, Link, NotifyFooterForm, ContentContainer } from '@/src/components/atoms';
import { Socials } from '@/src/components/atoms/Socials';
import { NavigationType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';

export const Footer: React.FC<{
    navigation: RootNode<NavigationType> | null;
}> = ({ navigation }) => {
    const { t } = useTranslation('common');

    const footerLaw = t('footer.law', { returnObjects: true });

    return (
        <Wrapper>
            <Main>
                <ContentContainer>
                    <Container column justifyBetween>
                        <Stack column gap="1rem" style={{ marginRight: '4rem' }}>
                            <Stack column>
                                <TypoGraphy as="h2" weight={400} size="2.5rem">
                                    {t('footer.notify.header')}
                                </TypoGraphy>
                                <TypoGraphy as="p" weight={400} size="1.5rem">
                                    {t('footer.notify.paragraph')}
                                </TypoGraphy>
                            </Stack>
                            <NotifyFooterForm />
                        </Stack>
                        <FooterSections justifyBetween>
                            {navigation?.children
                                .filter(c => c.slug !== 'all' && c.slug !== 'search')
                                .map(section => {
                                    const href =
                                        section.parent?.slug !== '__root_collection__'
                                            ? `/collections/${section.parent?.slug}/${section.slug}`
                                            : `/collections/${section.slug}`;
                                    return (
                                        <Stack key={section.name} column>
                                            <TypoGraphy as="h3" size="1.5rem" weight={600}>
                                                {section.name}
                                            </TypoGraphy>
                                            <Stack column gap="2rem">
                                                {section.children.map(link => (
                                                    <Link key={link.slug} href={href}>
                                                        {link.name}
                                                    </Link>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    );
                                })}
                        </FooterSections>
                    </Container>
                </ContentContainer>
            </Main>
            <LawsWrapper>
                <ContentContainer>
                    <Stack justifyBetween itemsCenter>
                        <Laws>
                            {footerLaw?.map(l => (
                                <Link key={l.name} href={l.href}>
                                    {l.name}
                                </Link>
                            ))}
                        </Laws>
                        <Socials />
                    </Stack>
                </ContentContainer>
            </LawsWrapper>
            <LinkBar>
                <Link href="https://aexol.com/" external>
                    <p>
                        Made by <strong>Aexol</strong>
                    </p>
                </Link>
            </LinkBar>
        </Wrapper>
    );
};

const Wrapper = styled.footer`
    h2,
    p {
        width: max-content;
        line-height: 3.5rem;
    }
    h3 {
        margin-bottom: 3rem;
        text-transform: uppercase;
    }
    a {
        text-transform: capitalize;
        color: ${({ theme }) => theme.text.main};
        transform: opacity 0.25s ease-in-out;
        &:hover {
            opacity: 0.7;
        }
    }
`;
const Main = styled(Stack)`
    gap: 5rem;
    background-color: ${({ theme }) => theme.background.secondary};
`;

const Container = styled(Stack)`
    gap: 2rem;
    padding: 3rem 0;
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        padding: 13.5rem 0 14.5rem 0rem;
    }
    @media (min-width: ${p => p.theme.breakpoints.lg}) {
        gap: 0;
        flex-direction: row;
    }
`;
const FooterSections = styled(Stack)`
    > div {
        width: min-content;
    }
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        gap: 10rem;
        justify-content: flex-start;
        > div {
            width: max-content;
        }
    }
    @media (min-width: ${p => p.theme.breakpoints['2xl']}) {
        gap: 14rem;
    }
`;
const LawsWrapper = styled(Stack)`
    background: ${({ theme }) => theme.background.third};
    padding: 3rem 0;
`;

const Laws = styled(Stack)`
    gap: 1.5rem;
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        gap: 5rem;
    }
`;
const LinkBar = styled.div`
    width: 100%;
    height: fit-content;
    background-color: ${({ theme }) => theme.background.third};
    display: flex;
    justify-content: center;
    user-select: none;
    & p {
        font-size: 1rem;
    }
    & strong {
        text-transform: uppercase;
        font-weight: 900;
        color: gray;
    }
`;
