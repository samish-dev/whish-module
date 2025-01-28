import axios, { AxiosResponse } from "axios";
import { BalanceDetails, CollectStatusDetails, CollectStatusProps, PaymentDetails, PaymentProps } from "./types";
import { WishResponse } from "./whish";
import { WishPaymentApiError } from "./util/APIException";


export class WishPaymentClient {
    private headers: Record<string, string>;

    constructor(
        private config: {
            baseUrl: string;
            channel: string;
            secret: string;
            websiteUrl: string;
        }
    ) {
        this.headers = {
            channel: this.config.channel,
            secret: this.config.secret,
            websiteurl: this.config.websiteUrl,
            "Content-Type": "application/json",
        };
    }

    async getBalance(): Promise<WishResponse<BalanceDetails>> {
        try {
            const response: AxiosResponse<WishResponse<BalanceDetails>> =
                await axios.get(`${this.config.baseUrl}/payment/account/balance`, {
                    headers: this.headers,
                });
            return response.data;
        } catch (error) {
            this.handleRequestError(error);
        }
    }

    async getPaymentLink(props: PaymentProps): Promise<WishResponse<PaymentDetails>> {
        try {
            const response: AxiosResponse<WishResponse<PaymentDetails>> = await axios.post(`${this.config.baseUrl}/payment/whish`, props, { headers: this.headers });
            return response.data;
        } catch (error) {
            this.handleRequestError(error);
        }
    }

    async getPaymentStatus(props: CollectStatusProps): Promise<WishResponse<CollectStatusDetails>> {
        try {
            const response: AxiosResponse<WishResponse<CollectStatusDetails>> = await axios.post(`${this.config.baseUrl}/payment/collect/status`, props, { headers: this.headers });
            return response.data;
        } catch (error) {
            this.handleRequestError(error);
        }
    }

    private handleRequestError(error: unknown): never {
        if (axios.isAxiosError(error)) {
          // Extract details from the Axios error
          const statusCode = error.response?.status || 500;
          const errorData = error.response?.data || {};
      
          throw new WishPaymentApiError(
            errorData.message || "Unknown API error occurred",
            statusCode,
            errorData.code || null,
            errorData.details || null
          );
        } else if (error instanceof Error) {
          // Handle generic errors
          throw new WishPaymentApiError(error.message, 500);
        } else {
          // Handle unexpected errors
          throw new WishPaymentApiError("Unexpected error occurred", 500);
        }
      }

}