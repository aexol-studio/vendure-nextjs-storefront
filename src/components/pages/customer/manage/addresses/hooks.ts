import { storefrontApiQuery, storefrontApiMutation } from '@/src/graphql/client';
import {
    ActiveAddressType,
    ActiveCustomerSelector,
    ActiveCustomerType,
    CreateAddressType,
} from '@/src/graphql/selectors';
import { useState, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';

export const useAddresses = (customer: ActiveCustomerType, ctx: { locale: string; channel: string }) => {
    const [activeCustomer, setActiveCustomer] = useState<ActiveCustomerType>(customer);
    const [addressToEdit, setAddressToEdit] = useState<ActiveAddressType>();
    const [deleting, setDeleting] = useState<string>();
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            const { activeCustomer } = await storefrontApiQuery(ctx)({
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

        try {
            const { updateCustomerAddress } = await storefrontApiMutation(ctx)({
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
            const { createCustomerAddress } = await storefrontApiMutation(ctx)({
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
        setDeleting(id);
        try {
            const { deleteCustomerAddress } = await storefrontApiMutation(ctx)({
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
        deleting,
        onEdit,
        onModalClose,
        onSubmitEdit,
        onSubmitCreate,
        onDelete,
    };
};
