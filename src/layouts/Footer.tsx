import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import { Stack, TypoGraphy, Link, NotifyFooterForm } from '@/src/components/atoms';
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
            <Main column justifyBetween>
                <Stack column style={{ marginRight: '4rem' }}>
                    <Stack column>
                        <TypoGraphy as="h2" weight={400} size="2rem">
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
                        .map(section => (
                            <Stack key={section.name} column>
                                <TypoGraphy as="h3" size="1.5rem" weight={600}>
                                    {section.name}
                                </TypoGraphy>
                                <Stack column gap="2rem">
                                    {section.children.map(link => (
                                        <Link key={link.slug} href={`/collections/${link.slug}`}>
                                            {link.name}
                                        </Link>
                                    ))}
                                </Stack>
                            </Stack>
                        ))}
                </FooterSections>
            </Main>
            <LawsWrapper justifyBetween itemsCenter>
                <Laws>
                    {footerLaw.map(l => (
                        <Link key={l} href="#">
                            {l}
                        </Link>
                    ))}
                </Laws>
                <Socials />
            </LawsWrapper>
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
    }
`;
const Main = styled(Stack)`
    padding: 5rem;
    gap: 5rem;
    background-color: ${({ theme }) => theme.background.secondary};
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        padding: 13.5rem 7rem 14.5rem 10.5rem;
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
    padding: 3rem 6rem;
`;

const Laws = styled(Stack)`
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        gap: 5rem;
    }
`;
