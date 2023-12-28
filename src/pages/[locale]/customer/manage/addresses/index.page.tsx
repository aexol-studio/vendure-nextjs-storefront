import { Layout } from '@/src/layouts';
import { makeServerSideProps, prepareSSRRedirect } from '@/src/lib/getStatic';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import React, { useEffect, useRef, useState } from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { CustomerNavigation } from '../components/CustomerNavigation';
import { SSRQuery, storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import {
    ActiveCustomerType,
    ActiveCustomerSelector,
    ActiveAddressType,
    CreateAddressType,
    AvailableCountriesSelector,
} from '@/src/graphql/selectors';
import { AddressBox } from './components/AddressBox';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { AnimatePresence, motion } from 'framer-motion';
import { SubmitHandler } from 'react-hook-form';
import { AddressForm } from './components/AddressForm';

const Addresses: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const [activeCustomer, setActiveCustomer] = useState<ActiveCustomerType>(props.activeCustomer);
    const [addressToEdit, setAddressToEdit] = useState<ActiveAddressType>();
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState<string>();
    const [refresh, setRefresh] = useState(false);

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

    useEffect(() => {
        const fetchCustomer = async () => {
            const { activeCustomer } = await storefrontApiQuery({
                activeCustomer: ActiveCustomerSelector,
            });
            if (activeCustomer) setActiveCustomer(activeCustomer);
            setRefresh(false);
        };
        if (refresh) fetchCustomer();
    }, [refresh]);

    const onEdit = (id: string) => {
        const address = activeCustomer?.addresses?.find(address => address.id === id);
        setAddressToEdit(address);
    };

    const onModalClose = () => setAddressToEdit(undefined);

    const onSubmitEdit: SubmitHandler<CreateAddressType> = async data => {
        if (!addressToEdit) {
            return;
        }

        const input = {
            ...data,
            id: addressToEdit?.id,
        };

        const isSame = Object.keys(input).every(key => {
            if (key === 'id') return true;
            if (key === 'countryCode') return input[key as keyof CreateAddressType] === addressToEdit.country.code;
            return input[key as keyof CreateAddressType] === addressToEdit[key as keyof ActiveAddressType];
        });

        if (isSame) {
            return;
        }

        setEditing(true);

        try {
            const { updateCustomerAddress } = await storefrontApiMutation({
                updateCustomerAddress: [{ input }, { __typename: true, id: true }],
            });
            setEditing(false);
            if (updateCustomerAddress) {
                setRefresh(true);
                onModalClose();
            }
        } catch (e) {
            setEditing(false);
        }
    };

    const onSubmitCreate: SubmitHandler<CreateAddressType> = async data => {
        setAdding(true);
        try {
            const { createCustomerAddress } = await storefrontApiMutation({
                createCustomerAddress: [{ input: data }, { __typename: true, id: true }],
            });
            setAdding(false);
            if (createCustomerAddress) {
                setRefresh(true);
            }
        } catch (e) {
            setAdding(false);
        }
    };

    const onDelete = async (id: string) => {
        setDeleting(id);
        try {
            const { deleteCustomerAddress } = await storefrontApiMutation({
                deleteCustomerAddress: [{ id }, { success: true }],
            });
            setDeleting(undefined);
            if (deleteCustomerAddress.success) {
                setRefresh(true);
            }
        } catch (e) {
            setDeleting(undefined);
        }
    };

    return (
        <Layout categories={props.collections}>
            <AnimatePresence>
                {addressToEdit && (
                    <Modal initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent ref={ref} itemsCenter column>
                            <AddressForm
                                loading={editing}
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
                        <FormWrapper w100>
                            <AddressForm
                                loading={adding}
                                onSubmit={onSubmitCreate}
                                availableCountries={props.availableCountries}
                            />
                        </FormWrapper>
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

const CustomerWrap = styled(Stack)`
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        flex-direction: column;
    }
`;

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

const FormWrapper = styled(Stack)``;

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
    const destination = prepareSSRRedirect('/')(context);

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
        };

        return { props: returnedStuff };
    } catch (error) {
        return destination;
    }
};

export { getServerSideProps };
export default Addresses;
