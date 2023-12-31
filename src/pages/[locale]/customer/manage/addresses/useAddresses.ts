import { storefrontApiQuery, storefrontApiMutation } from '@/src/graphql/client';
import {
    ActiveAddressType,
    ActiveCustomerSelector,
    ActiveCustomerType,
    CreateAddressType,
} from '@/src/graphql/selectors';
import { useState, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';

export const useAddresses = (customer: ActiveCustomerType) => {
    const [activeCustomer, setActiveCustomer] = useState<ActiveCustomerType>(customer);
    const [addressToEdit, setAddressToEdit] = useState<ActiveAddressType>();
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState<string>();
    const [refresh, setRefresh] = useState(false);

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

    return {
        activeCustomer,
        addressToEdit,
        editing,
        adding,
        deleting,
        onEdit,
        onModalClose,
        onSubmitEdit,
        onSubmitCreate,
        onDelete,
    };
};
