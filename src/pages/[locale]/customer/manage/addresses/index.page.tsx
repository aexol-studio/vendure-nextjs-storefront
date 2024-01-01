import { Layout } from '@/src/layouts';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React, { useEffect, useRef } from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { SSRQuery, storefrontApiQuery } from '@/src/graphql/client';
import { ActiveCustomerSelector, AvailableCountriesSelector } from '@/src/graphql/selectors';
import { AddressBox } from './components/AddressBox';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { AnimatePresence, motion } from 'framer-motion';
import { AddressForm } from './components/AddressForm';
import { useAddresses } from './useAddresses';
import { arrayToTree } from '@/src/util/arrayToTree';
import { useTranslation } from 'next-i18next';
import { CustomerWrap } from '../../components/shared';

const Addresses: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const { t } = useTranslation('customer');
    const { activeCustomer, addressToEdit, deleting, onDelete, onEdit, onModalClose, onSubmitCreate, onSubmitEdit } =
        useAddresses(props.activeCustomer);

    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onModalClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Layout categories={props.collections} navigation={props.navigation} pageTitle={t('addressesPageTitle')}>
            <AnimatePresence>
                {addressToEdit && (
                    <Modal initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent ref={ref} itemsCenter column>
                            <AddressForm
                                onSubmit={onSubmitEdit}
                                availableCountries={props.availableCountries}
                                addressToEdit={addressToEdit}
                                onModalClose={onModalClose}
                            />
                        </ModalContent>
                    </Modal>
                )}
            </AnimatePresence>
            <ContentContainer>
                <CustomerWrap w100 itemsStart gap="1.75rem">
                    <CustomerNavigation />
                    <Wrapper w100 gap="1.5rem">
                        <Stack w100>
                            <AddressForm onSubmit={onSubmitCreate} availableCountries={props.availableCountries} />
                        </Stack>
                        <Wrap w100 itemsCenter gap="2.5rem">
                            {activeCustomer?.addresses?.map(address => (
                                <AddressBox
                                    key={address.id}
                                    address={address}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    deleting={deleting}
                                />
                            ))}
                        </Wrap>
                    </Wrapper>
                </CustomerWrap>
            </ContentContainer>
        </Layout>
    );
};

const Wrapper = styled(Stack)`
    justify-content: space-evenly;
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        flex-direction: column-reverse;
    }
`;

const Wrap = styled(Stack)`
    overflow: auto;
    max-height: 80vh;
    padding: 1.75rem 0.5rem;

    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
        flex-direction: column;
    }

    ::-webkit-scrollbar {
        height: 0.8rem;
        width: 0.8rem;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: ${p => p.theme.gray(200)};
        border-radius: 1rem;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: ${p => p.theme.gray(400)};
    }
`;

const ModalContent = styled(Stack)`
    width: fit-content;
    padding: 3.5rem;
    background-color: white;
    border-radius: ${p => p.theme.borderRadius};
`;

const Modal = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100vw;
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: rgba(0, 0, 0, 0.5);
`;

const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const r = await makeServerSideProps(['common', 'customer'])(context);
    const collections = await getCollections();
    const navigation = arrayToTree(collections);
    const homePageRedirect = prepareSSRRedirect('/')(context);

    try {
        const { activeCustomer } = await SSRQuery(context)({
            activeCustomer: ActiveCustomerSelector,
        });
        if (!activeCustomer) throw new Error('No active customer');

        const { availableCountries } = await storefrontApiQuery({
            availableCountries: AvailableCountriesSelector,
        });

        const returnedStuff = {
            ...r.props,
            collections,
            activeCustomer,
            availableCountries,
            navigation,
        };

        return { props: returnedStuff };
    } catch (error) {
        return homePageRedirect;
    }
};

export { getServerSideProps };
export default Addresses;
