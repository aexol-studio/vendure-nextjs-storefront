import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

export const Footer = () => {
    const { t } = useTranslation('common');
    return (
        <Main>
            <ContentContainer>
                <Stack justifyCenter>
                    <TP>{t('made-by')}</TP>
                </Stack>
            </ContentContainer>
        </Main>
    );
};

const Main = styled.footer`
    width: 100%;
    margin-top: auto;
    padding: 4rem;
    background-color: ${p => p.theme.gray(100)};
`;
