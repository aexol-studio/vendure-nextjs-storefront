import { Layout } from '@/src/layouts';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { CustomerNavigation } from './components/CustomerNavigation';
import { CustomerForm } from './components/CustomerForm';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { useTranslation } from 'next-i18next';
import { CustomerWrap } from '../components/shared';
import { getServerSideProps } from './props';

export const ManageAccountPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    return (
        <Layout categories={props.collections} navigation={props.navigation} pageTitle={t('accountPage.title')}>
            <ContentContainer>
                <CustomerWrap itemsStart w100 gap="3rem">
                    <CustomerNavigation language={props.language} />
                    <CustomerForm
                        initialCustomer={props.activeCustomer}
                        order={props.lastOrder}
                        language={props.language}
                    />
                </CustomerWrap>
            </ContentContainer>
        </Layout>
    );
};
