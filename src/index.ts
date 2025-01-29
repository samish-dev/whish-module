import axios, { AxiosResponse } from "axios";
import { BalanceDetails, CollectStatusDetails, CollectStatusProps, ENV_MODE, PaymentDetails, PaymentProps, WhishResponse } from "./types";
import { WhishPaymentApiError } from "./util/APIException";


export default class WhishPaymentClient {
    private headers: Record<string, string>;
    private baseUrl: string;

    constructor(
        private config: {
            env: ENV_MODE;
            channel: string;
            secret: string;
            websiteUrl: string;
        }
    ) {
        this.baseUrl = this.getUrl();
        this.headers = {
            channel: this.config.channel,
            secret: this.config.secret,
            websiteurl: this.config.websiteUrl,
            "Content-Type": "application/json",
        };
    }

    async getBalance(): Promise<BalanceDetails> {
        try {
            const response: AxiosResponse<WhishResponse<BalanceDetails>> =
                await axios.get(`${this.baseUrl}/payment/account/balance`, {
                    headers: this.headers,
                });
            if (!response.status) {
                throw new WhishPaymentApiError("Failed to get balance", 500, null, response.statusText);
            }
            return response.data.data;
        } catch (error) {
            this.handleRequestError(error);
        }
    }

    async getPaymentLink(props: PaymentProps): Promise<PaymentDetails> {
        try {
            const response: AxiosResponse<WhishResponse<PaymentDetails>> = await axios.post(`${this.baseUrl}/payment/whish`, props, { headers: this.headers });
            if (!response.status) {
                throw new WhishPaymentApiError("Failed to generate payment link", 500, null, response.statusText);
            }
            return response.data.data;
        } catch (error) {
            this.handleRequestError(error);
        }
    }

    async getPaymentStatus(props: CollectStatusProps): Promise<CollectStatusDetails> {
        try {
            const response: AxiosResponse<WhishResponse<CollectStatusDetails>> = await axios.post(`${this.baseUrl}/payment/collect/status`, props, { headers: this.headers });
            return response.data.data;
        } catch (error) {
            this.handleRequestError(error);
        }
    }

    getUrl() {
        switch (this.config.env) {
            case 'development':
                return 'https://lb.sandbox.whish.money/itel-service/api';
            case 'production':
                return 'https://whish.money/itel-service/api';
        }
    }
    private handleRequestError(error: unknown): never {
        if (axios.isAxiosError(error)) {
            // Extract details from the Axios error
            const statusCode = error.response?.status || 500;
            const errorData = error.response?.data || {};

            throw new WhishPaymentApiError(
                errorData.message || "Unknown API error occurred",
                statusCode,
                errorData.code || null,
                errorData.details || null
            );
        } else if (error instanceof Error) {
            // Handle generic errors
            throw new WhishPaymentApiError(error.message, 500);
        } else {
            // Handle unexpected errors
            throw new WhishPaymentApiError("Unexpected error occurred", 500);
        }
    }
}
