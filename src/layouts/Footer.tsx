import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { FooterSection } from '@/src/components/molecules/FooterSection';
import { Socials } from '@/src/components/atoms/Socials';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Copy } from '@/src/components/atoms/Copy';
import { Link } from '@/src/components/atoms/Link';

export const Footer = () => {
    const { t } = useTranslation('common');

    const footerSections = t('footer.sections', { returnObjects: true });
    const footerLaw = t('footer.law', { returnObjects: true });

    const mode = 'light';
    return (
        <Main mode={mode}>
            <ContentContainer>
                <UpperPart column justifyBetween>
                    <LinksGrid>
                        {footerSections.map(section => (
                            <FooterSection {...section} key={section.header} />
                        ))}
                    </LinksGrid>
                    <Socials />
                </UpperPart>
            </ContentContainer>
            <Rules justifyCenter>
                <ContentContainer>
                    <Stack justifyBetween itemsCenter w100>
                        <Stack gap="1rem">
                            {footerLaw.map(l => (
                                <Link href="#" key={l} style={{ color: 'inherit' }}>
                                    <TP size="1rem">{l}</TP>
                                </Link>
                            ))}
                        </Stack>
                        <Copy />
                    </Stack>
                </ContentContainer>
            </Rules>
        </Main>
    );
};

const Main = styled.footer<{ mode?: string }>`
    margin-top: 4rem;
    border-top: 1px solid ${p => p.theme.gray(100)};
    background-color: ${({ mode, theme }) => (mode === 'light' ? theme.background.main : theme.gray(800))};
    color: ${({ mode, theme }) => (mode === 'light' ? theme.gray(800) : theme.gray(200))};
    width: 100%;
`;

const LinksGrid = styled.div`
    width: max-content;
    gap: 2rem;
    column-gap: 3rem;
    display: grid;
    grid-template-columns: auto auto auto;
`;
const UpperPart = styled(Stack)`
    padding-block: 4rem;
`;

const Rules = styled(Stack)`
    border-top: 1px solid ${p => p.theme.gray(100)};
    padding-block: 2rem;
`;
