import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { WishPaymentClient } from "../src/index";
import { WishPaymentApiError } from "../src/util/APIException";
import {
  BalanceDetails,
  CollectStatusDetails,
  CollectStatusProps,
  PaymentDetails,
  PaymentProps,
} from "../src/types";

// Mock Axios
const mockAxios = new MockAdapter(axios);

describe("WishPaymentClient", () => {
  const baseUrl = "https://api.payment-service.com";
  const client = new WishPaymentClient({
    baseUrl,
    channel: "test-channel",
    secret: "test-secret",
    websiteUrl: "test-website",
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe("getBalance", () => {
    it("should return balance details on success", async () => {
      const mockResponse = {
        status: true,
        code: null,
        dialog: null,
        actions: null,
        extra: null,
        retrieved: true,
        data: { balance: 1000 },
      };

      mockAxios.onGet(`${baseUrl}/payment/account/balance`).reply(200, mockResponse);

      const result = await client.getBalance();
      expect(result).toEqual(mockResponse);
    });

    it("should throw WishPaymentApiError on API failure", async () => {
      const mockError = {
        message: "Unauthorized",
        code: "UNAUTHORIZED",
        details: null,
      };

      mockAxios.onGet(`${baseUrl}/payment/account/balance`).reply(401, mockError);

      await expect(client.getBalance()).rejects.toThrow(WishPaymentApiError);
    });
  });

  describe("getPaymentLink", () => {
    it("should return payment details on success", async () => {
      const mockResponse = {
        status: true,
        code: null,
        dialog: null,
        actions: null,
        extra: null,
        retrieved: true,
        data: { collectUrl: "https://payment-link.com" },
      };

      const paymentProps: PaymentProps = {
        amount: 1000,
        currency: "USD",
        invoice: "INV-123",
        externalId: 12345,
        successCallbackUrl: "https://success.com",
        failureCallbackUrl: "https://failure.com",
        successRedirectUrl: "https://redirect-success.com",
        failureRedirectUrl: "https://redirect-failure.com",
      };

      mockAxios.onPost(`${baseUrl}/payment/whish`).reply(200, mockResponse);

      const result = await client.getPaymentLink(paymentProps);
      expect(result).toEqual(mockResponse);
    });

    it("should throw WishPaymentApiError on API failure", async () => {
      const mockError = {
        message: "Invalid request",
        code: "INVALID_REQUEST",
        details: { field: "amount" },
      };

      mockAxios.onPost(`${baseUrl}/payment/whish`).reply(400, mockError);

      await expect(client.getPaymentLink({} as any)).rejects.toThrow(WishPaymentApiError);
    });
  });

  describe("getPaymentStatus", () => {
    it("should return payment status details on success", async () => {
      const mockResponse = {
        status: true,
        code: null,
        dialog: null,
        actions: null,
        extra: null,
        retrieved: true,
        data: { collectStatus: "success" },
      };

      const statusProps: CollectStatusProps = {
        amount: 1000,
        currency: "USD",
        externalId: 12345,
      };

      mockAxios.onPost(`${baseUrl}/payment/collect/status`).reply(200, mockResponse);

      const result = await client.getPaymentStatus(statusProps);
      expect(result).toEqual(mockResponse);
    });

    it("should throw WishPaymentApiError on API failure", async () => {
      const mockError = {
        message: "Payment not found",
        code: "PAYMENT_NOT_FOUND",
        details: null,
      };

      mockAxios.onPost(`${baseUrl}/payment/collect/status`).reply(404, mockError);

      await expect(client.getPaymentStatus({} as any)).rejects.toThrow(WishPaymentApiError);
    });
  });
});