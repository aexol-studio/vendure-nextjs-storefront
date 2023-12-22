import { OrderStateType } from '@/src/graphql/selectors';
import {
    PackagePlus,
    PenSquare,
    ShoppingCart,
    Ban,
    Wallet,
    CreditCard,
    Truck,
    Container,
    Home,
    HelpCircle,
} from 'lucide-react';

export const orderStateToIcon = (_state: string, size: number = 20) => {
    const state = _state as OrderStateType;
    switch (state) {
        case 'Created':
            return <PackagePlus size={size} />;
        case 'Draft':
            return <PenSquare size={size} />;
        case 'AddingItems':
            return <ShoppingCart size={size} />;
        case 'Cancelled':
            return <Ban size={size} />;
        case 'ArrangingPayment':
            return <Wallet size={size} />;
        case 'PaymentAuthorized':
            return <CreditCard size={size} />;
        case 'PaymentSettled':
            return <CreditCard size={size} />;
        case 'PartiallyShipped':
            return <Truck size={size} />;
        case 'Shipped':
            return <Truck size={size} />;
        case 'PartiallyDelivered':
            return <Container size={size} />;
        case 'Delivered':
            return <Home size={size} />;
        case 'Modifying':
            return <PenSquare size={size} />;
        case 'ArrangingAdditionalPayment':
            return <CreditCard size={size} />;
        default: {
            if (_state.includes('Payment')) {
                return <CreditCard size={size} />;
            }
            if (_state.includes('Shipped')) {
                return <Truck size={size} />;
            }
            if (_state.includes('Delivered')) {
                return <Home size={size} />;
            }
            return <HelpCircle size={size} />;
        }
    }
};
