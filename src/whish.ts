import axios, { AxiosResponse } from "axios";

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
    collectStatus: 'success' | 'failed' | 'pending';
}

export const allowedCurrencies = ['USD', 'LBP', 'AED'] as const;
export type Currency = typeof allowedCurrencies[number]; // "USD" | "LBP" | "AED"

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
    currency: "LBP" | "USD" | "AED";
    externalId: number;
}

// Configuration and constants
const baseUrl = process.env.PAYMENT_SERVICE_URL;

const secrets = {
    channel: 10193443,
    secret: '7fdeb295a6a14a118088710fe7c67e85',
    websiteurl: 'samish.dev',
};

const headers = {
    ...secrets,
    'Content-Type': 'application/json'
};

const handleRequestError: (error: any) => never = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        console.error(`Axios error: ${error.response?.data || error.message}`);
    } else {
        console.error(`Unexpected error: ${error}`);
    }
    throw error;
};

export const getBalance = async (): Promise<WishResponse<BalanceDetails>> => {
    try {
        const response: AxiosResponse<WishResponse<BalanceDetails>> = await axios.get(`${baseUrl}/payment/account/balance`, { headers });
        return response.data;
    } catch (error) {
        handleRequestError(error);
    }
};

export const getPaymentLink = async (props: PaymentProps): Promise<WishResponse<PaymentDetails>> => {
    try {
        const response: AxiosResponse<WishResponse<PaymentDetails>> = await axios.post(`${baseUrl}/payment/whish`, props, { headers });
        return response.data;
    } catch (error) {
        handleRequestError(error);
    }
};

export const getPaymentStatus = async (props: CollectStatusProps): Promise<WishResponse<CollectStatusDetails>> => {
    try {
        const response: AxiosResponse<WishResponse<CollectStatusDetails>> = await axios.post(`${baseUrl}/payment/collect/status`, props, { headers });
        return response.data;
    } catch (error) {
        handleRequestError(error);
    }
};

const main = async () => {
    try {
        const balance = await getBalance();
        console.log('Balance:', balance);
        const externalId = Date.now();

        console.log("externalId:",externalId);
        const paymentLink = await getPaymentLink({
            amount: 1000000,
            currency: 'LBP',
            invoice: "INV-12345",
            externalId,
            successCallbackUrl: "http://localhost:5000/success",
            failureCallbackUrl: "http://localhost:5000/failure",
            successRedirectUrl: "http://localhost:5000/success-redirect",
            failureRedirectUrl: "http://localhost:5000/failure-redirect",
        });
        console.log('Payment Link:', paymentLink.data.collectUrl);

        const paymentStatus = await getPaymentStatus({
            amount: 100,
            currency: 'LBP',
            externalId,
        });
        console.log('Payment Status:', paymentStatus);
    } catch (error) {
        console.error('Error in main function:', error);
    }
};

if (require.main === module) {
    main();
}

export default {
    getBalance,
    getPaymentLink,
    getPaymentStatus,
};

// Test Cases:

// SUCCESS: on the payment page use the following phone number with OTP 111111

// Account with balance: 96170902894

// FAILURE: on the payment page use any phone number with OTP other than 111111