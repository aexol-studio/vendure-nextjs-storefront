import { Layout } from '@/src/layouts';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { CustomerNavigation } from './components/CustomerNavigation';
import { CustomerForm } from './components/CustomerForm';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { useTranslation } from 'next-i18next';
import { CustomerWrap } from '../components/shared';
import { getServerSideProps } from './props';
import { Stack } from '@/src/components/atoms';

export const ManageAccountPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    return (
        <Layout categories={props.collections} navigation={props.navigation} pageTitle={t('accountPage.title')}>
            <ContentContainer>
                <Stack w100 justifyEnd>
                    <CustomerNavigation />
                </Stack>
                <CustomerWrap itemsStart w100 gap="3rem">
                    <CustomerForm initialCustomer={props.activeCustomer} />
                </CustomerWrap>
            </ContentContainer>
        </Layout>
    );
};
