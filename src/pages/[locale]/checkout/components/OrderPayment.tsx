import { TP } from '@/src/components/atoms/TypoGraphy';
import { storefrontApiMutation, storefrontApiQuery } from '@/src/graphql/client';
import {
    ActiveOrderSelector,
    AvailablePaymentMethodsSelector,
    AvailablePaymentMethodsType,
} from '@/src/graphql/selectors';
import { usePush } from '@/src/lib/redirect';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';

type Form = {
    paymentMethod: string;
};

export const OrderPayment = () => {
    const { t } = useTranslation('checkout');
    const push = usePush();
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethodsType[]>();
    useEffect(() => {
        storefrontApiQuery({
            eligiblePaymentMethods: AvailablePaymentMethodsSelector,
        }).then(response => {
            if (response?.eligiblePaymentMethods) {
                setAvailablePaymentMethods(response.eligiblePaymentMethods);
            }
        });
        storefrontApiMutation({
            transitionOrderToState: [
                { state: 'ArrangingPayment' },
                {
                    '...on Order': ActiveOrderSelector,
                    '...on OrderStateTransitionError': {
                        errorCode: true,
                        message: true,
                        fromState: true,
                        toState: true,
                        transitionError: true,
                    },
                },
            ],
        }).then(response => {
            console.log(response);
        });
    }, []);

    const {
        register,
        handleSubmit,
        // watch,
        // formState: { errors },
    } = useForm<Form>({});

    const onSubmit: SubmitHandler<Form> = async data => {
        console.log(data);
        const { addPaymentToOrder } = await storefrontApiMutation({
            addPaymentToOrder: [
                {
                    input: {
                        metadata: {},
                        method: data.paymentMethod,
                    },
                },
                {
                    __typename: true,
                    '...on Order': ActiveOrderSelector,
                    '...on IneligiblePaymentMethodError': {
                        message: true,
                        errorCode: true,
                        eligibilityCheckerMessage: true,
                    },
                    '...on NoActiveOrderError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on OrderPaymentStateError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on OrderStateTransitionError': {
                        message: true,
                        errorCode: true,
                        fromState: true,
                        toState: true,
                        transitionError: true,
                    },
                    '...on PaymentDeclinedError': {
                        errorCode: true,
                        message: true,
                        paymentErrorMessage: true,
                    },
                    '...on PaymentFailedError': {
                        errorCode: true,
                        message: true,
                        paymentErrorMessage: true,
                    },
                },
            ],
        });
        console.log(addPaymentToOrder);
        if (addPaymentToOrder.__typename === 'Order' && addPaymentToOrder.state === 'PaymentAuthorized') {
            push(`/checkout/confirmation?${addPaymentToOrder.code}`);
        }
    };

    return (
        <div>
            <TP>{t('paymentMethod.title')}</TP>
            <form onSubmit={handleSubmit(onSubmit)}>
                {availablePaymentMethods?.map(paymentMethod => {
                    return (
                        <div key={paymentMethod.code}>
                            <input
                                id={paymentMethod.code}
                                value={paymentMethod.code}
                                type="radio"
                                {...register('paymentMethod')}
                            />
                            <label htmlFor={paymentMethod.code}>{paymentMethod.name}</label>
                        </div>
                    );
                })}
                <button type="submit">{t('paymentMethod.submit')}</button>
            </form>
        </div>
    );
};
