import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React, { useEffect, useState } from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import {
    ActiveCustomerType,
    ActiveCustomerSelector,
    ActiveAddressType,
    CreateAddressType,
    AvailableCountriesSelector,
} from '@/src/graphql/selectors';
import { AddressBox } from '../components/AddressBox';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { AnimatePresence, motion } from 'framer-motion';
import { SubmitHandler } from 'react-hook-form';
import { AddressForm } from '../components/AddressForm';

const Addresses: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const [addressToEdit, setAddressToEdit] = useState<ActiveAddressType>();
    const [activeCustomer, setActiveCustomer] = useState<ActiveCustomerType>();
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            const { activeCustomer } = await storefrontApiQuery({
                activeCustomer: ActiveCustomerSelector,
            });
            setActiveCustomer(activeCustomer);
            setRefresh(false);
        };
        fetchCustomer();
    }, [refresh]);

    const onEdit = (id: string) => {
        const address = activeCustomer?.addresses?.find(address => address.id === id);
        setAddressToEdit(address);
    };
    const onModalClose = () => setAddressToEdit(undefined);

    const onSubmitEdit: SubmitHandler<CreateAddressType> = async data => {
        if (!addressToEdit) return;
        const input = {
            ...data,
            id: addressToEdit?.id,
        };
        try {
            const { updateCustomerAddress } = await storefrontApiMutation({
                updateCustomerAddress: [{ input }, { __typename: true, id: true }],
            });
            if (updateCustomerAddress) {
                setRefresh(true);
                onModalClose();
            }
        } catch (e) {
            console.log(e);
        }
    };

    const onSubmitCreate: SubmitHandler<CreateAddressType> = async data => {
        try {
            const { createCustomerAddress } = await storefrontApiMutation({
                createCustomerAddress: [{ input: data }, { __typename: true, id: true }],
            });
            if (createCustomerAddress) {
                setRefresh(true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const onDelete = async (id: string) => {
        try {
            const { deleteCustomerAddress } = await storefrontApiMutation({
                deleteCustomerAddress: [{ id }, { success: true }],
            });
            setRefresh(true);
            console.log(deleteCustomerAddress);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Layout categories={props.collections}>
            <AnimatePresence>
                {addressToEdit && (
                    <Modal initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent itemsCenter column>
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
                <CustomerNavigation />
                <Stack flexWrap>
                    <FormWrapper>
                        <AddressForm onSubmit={onSubmitCreate} availableCountries={props.availableCountries} />
                    </FormWrapper>
                    {activeCustomer?.addresses?.map(address => (
                        <AddressBox key={address.id} address={address} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const FormWrapper = styled(Stack)`
    width: fit-content;
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

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'checkout'])(context);
    const collections = await getCollections();

    const { availableCountries } = await storefrontApiQuery({
        availableCountries: AvailableCountriesSelector,
    });

    const returnedStuff = {
        ...r.props,
        collections,
        availableCountries,
    };

    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export { getStaticPaths, getStaticProps };
export default Addresses;
