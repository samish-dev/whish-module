// Interfaces
export interface WishResponse<T> {
    status: boolean;
    code: string | null;
    dialog: null;
    actions: null;
    extra: null;
    retrieved: boolean;
    data: T;
}

interface BalanceDetails {
    balance: number;
}

export interface PaymentDetails {
    collectUrl: string;
}

export interface CollectStatusDetails {
    collectStatus: Status;
}


export type Currency = 'USD' | 'LBP' | 'AED';
export type Status = 'success' | 'failed' | 'pending';

export interface PaymentProps {
    amount: number;
    currency: Currency;
    invoice: string;
    externalId: number;
    successCallbackUrl: string;
    failureCallbackUrl: string;
    successRedirectUrl: string;
    failureRedirectUrl: string;
}

export interface CollectStatusProps {
    amount: number;
    currency: Currency;
    externalId: number;
}