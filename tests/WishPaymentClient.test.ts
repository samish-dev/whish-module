/**
 * Comprehensive test suite for WhishPaymentClient
 */

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import WhishPaymentClient from "../src/index";
import { WhishPaymentApiError } from "../src/util/APIException";
import {
  CollectStatusProps,
  PaymentProps,
} from "../src/types";

// Mock Axios
const mockAxios = new MockAdapter(axios);

describe("WhishPaymentClient", () => {
  const validConfig = {
    env: 'development' as const,
    channel: "test-channel",
    secret: "test-secret",
    websiteUrl: "https://test-website.com",
    enableDebugLogging: false,
  };

  let client: WhishPaymentClient;
  let baseUrl: string;
  
  beforeEach(() => {
    client = new WhishPaymentClient(validConfig);
    baseUrl = client.getUrl();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe("constructor", () => {
    describe("configuration validation", () => {
      it("should create client with valid configuration", () => {
        expect(client).toBeDefined();
        expect(client.getUrl()).toBe('https://lb.sandbox.whish.money/itel-service/api');
      });

      it("should throw error for missing channel", () => {
        expect(() => new WhishPaymentClient({
          ...validConfig,
          channel: "",
        })).toThrow(WhishPaymentApiError);
      });

      it("should throw error for missing secret", () => {
        expect(() => new WhishPaymentClient({
          ...validConfig,
          secret: "",
        })).toThrow(WhishPaymentApiError);
      });

      it("should throw error for missing websiteUrl", () => {
        expect(() => new WhishPaymentClient({
          ...validConfig,
          websiteUrl: "",
        })).toThrow(WhishPaymentApiError);
      });

      it("should throw error for invalid environment", () => {
        expect(() => new WhishPaymentClient({
          ...validConfig,
          env: 'invalid' as any,
        })).toThrow(WhishPaymentApiError);
      });

      it("should throw error for invalid timeout", () => {
        expect(() => new WhishPaymentClient({
          ...validConfig,
          timeout: -1000,
        })).toThrow(WhishPaymentApiError);
      });

      it("should accept custom timeout", () => {
        const customClient = new WhishPaymentClient({
          ...validConfig,
          timeout: 5000,
        });
        expect(customClient).toBeDefined();
      });

      it("should accept custom base URL", () => {
        const customClient = new WhishPaymentClient({
          ...validConfig,
          baseUrl: "https://custom-api.com",
        });
        expect(customClient.getUrl()).toBe("https://custom-api.com");
      });

      it("should enable debug logging when configured", () => {
        const debugClient = new WhishPaymentClient({
          ...validConfig,
          enableDebugLogging: true,
        });
        expect(debugClient).toBeDefined();
      });
    });

    describe("environment URL selection", () => {
      it("should use development URL for development environment", () => {
        const devClient = new WhishPaymentClient({
          ...validConfig,
          env: 'development',
        });
        expect(devClient.getUrl()).toBe('https://lb.sandbox.whish.money/itel-service/api');
      });

      it("should use production URL for production environment", () => {
        const prodClient = new WhishPaymentClient({
          ...validConfig,
          env: 'production',
        });
        expect(prodClient.getUrl()).toBe('https://whish.money/itel-service/api');
      });
    });
  });

  describe("getBalance", () => {
    const mockSuccessResponse = {
      status: true,
      code: null,
      dialog: null,
      actions: null,
      extra: null,
      retrieved: true,
      data: { balance: 1000.50 },
    };

    it("should return balance details on success", async () => {
      mockAxios.onGet(`${baseUrl}/payment/account/balance`).reply(200, mockSuccessResponse);

      const result = await client.getBalance();
      expect(result).toEqual({ balance: 1000.50 });
    });

    it("should handle API failure responses", async () => {
      const failureResponse = {
        status: false,
        code: "UNAUTHORIZED",
        dialog: null,
        actions: null,
        extra: null,
        retrieved: false,
        data: null,
      };

      mockAxios.onGet(`${baseUrl}/payment/account/balance`).reply(200, failureResponse);

      await expect(client.getBalance()).rejects.toThrow(WhishPaymentApiError);
    });

    it("should handle HTTP error responses", async () => {
      const mockError = {
        message: "Unauthorized",
        code: "UNAUTHORIZED",
        details: null,
      };

      mockAxios.onGet(`${baseUrl}/payment/account/balance`).reply(401, mockError);

      await expect(client.getBalance()).rejects.toThrow(WhishPaymentApiError);
    });

    it("should handle network errors", async () => {
      mockAxios.onGet(`${baseUrl}/payment/account/balance`).networkError();

      await expect(client.getBalance()).rejects.toThrow(WhishPaymentApiError);
    });

    it("should handle timeout errors", async () => {
      mockAxios.onGet(`${baseUrl}/payment/account/balance`).timeout();

      await expect(client.getBalance()).rejects.toThrow(WhishPaymentApiError);
    });

    it("should handle invalid response format", async () => {
      mockAxios.onGet(`${baseUrl}/payment/account/balance`).reply(200, { invalid: "response" });

      await expect(client.getBalance()).rejects.toThrow(WhishPaymentApiError);
    });
  });

  describe("getPaymentLink", () => {
    const validPaymentProps: PaymentProps = {
      amount: 1000.50,
      currency: "USD",
      invoice: "Test Invoice #123",
      externalId: 12345,
      successCallbackUrl: "https://api.example.com/payment/success",
      failureCallbackUrl: "https://api.example.com/payment/failure",
      successRedirectUrl: "https://example.com/success",
      failureRedirectUrl: "https://example.com/failure",
    };

    const mockSuccessResponse = {
      status: true,
      code: null,
      dialog: null,
      actions: null,
      extra: null,
      retrieved: true,
      data: { collectUrl: "https://payment-link.whish.money/12345" },
    };

    it("should return payment details on success", async () => {
      mockAxios.onPost(`${baseUrl}/payment/whish`).reply(200, mockSuccessResponse);

      const result = await client.getPaymentLink(validPaymentProps);
      expect(result).toEqual({ collectUrl: "https://payment-link.whish.money/12345" });
    });

    describe("input validation", () => {
      it("should validate positive amount", async () => {
        const invalidProps = { ...validPaymentProps, amount: -100 };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate zero amount", async () => {
        const invalidProps = { ...validPaymentProps, amount: 0 };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate finite amount", async () => {
        const invalidProps = { ...validPaymentProps, amount: Infinity };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate currency", async () => {
        const invalidProps = { ...validPaymentProps, currency: "INVALID" as any };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate non-empty invoice", async () => {
        const invalidProps = { ...validPaymentProps, invoice: "" };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate invoice length", async () => {
        const invalidProps = { ...validPaymentProps, invoice: "x".repeat(256) };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate positive integer external ID", async () => {
        const invalidProps = { ...validPaymentProps, externalId: -1 };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate integer external ID", async () => {
        const invalidProps = { ...validPaymentProps, externalId: 123.45 };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate URL format for callback URLs", async () => {
        const invalidProps = { ...validPaymentProps, successCallbackUrl: "not-a-url" };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate URL protocol", async () => {
        const invalidProps = { ...validPaymentProps, successCallbackUrl: "ftp://invalid.com" };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate maximum amount", async () => {
        const invalidProps = { ...validPaymentProps, amount: 1000001 };
        await expect(client.getPaymentLink(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentLink(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });
    });

    it("should handle API errors", async () => {
      const mockError = {
        message: "Invalid request",
        code: "INVALID_REQUEST",
        details: { field: "amount" },
      };

      mockAxios.onPost(`${baseUrl}/payment/whish`).reply(400, mockError);

      await expect(client.getPaymentLink(validPaymentProps)).rejects.toThrow(WhishPaymentApiError);
    });
  });

  describe("getPaymentStatus", () => {
    const validStatusProps: CollectStatusProps = {
      amount: 1000.50,
      currency: "USD",
      externalId: 12345,
    };

    const mockSuccessResponse = {
      status: true,
      code: null,
      dialog: null,
      actions: null,
      extra: null,
      retrieved: true,
      data: { collectStatus: "success" as const },
    };

    it("should return payment status details on success", async () => {
      mockAxios.onPost(`${baseUrl}/payment/collect/status`).reply(200, mockSuccessResponse);

      const result = await client.getPaymentStatus(validStatusProps);
      expect(result).toEqual({ collectStatus: "success" });
    });

    describe("input validation", () => {
      it("should validate positive amount", async () => {
        const invalidProps = { ...validStatusProps, amount: 0 };
        await expect(client.getPaymentStatus(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentStatus(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate currency", async () => {
        const invalidProps = { ...validStatusProps, currency: "INVALID" as any };
        await expect(client.getPaymentStatus(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentStatus(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });

      it("should validate external ID", async () => {
        const invalidProps = { ...validStatusProps, externalId: -1 };
        await expect(client.getPaymentStatus(invalidProps)).rejects.toThrow(WhishPaymentApiError);
        try {
          await client.getPaymentStatus(invalidProps);
        } catch (error) {
          expect(error).toBeInstanceOf(WhishPaymentApiError);
          expect((error as WhishPaymentApiError).statusCode).toBe(400);
          expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
        }
      });
    });

    it("should handle payment not found", async () => {
      const mockError = {
        message: "Payment not found",
        code: "PAYMENT_NOT_FOUND",
        details: null,
      };

      mockAxios.onPost(`${baseUrl}/payment/collect/status`).reply(404, mockError);

      await expect(client.getPaymentStatus(validStatusProps)).rejects.toThrow(WhishPaymentApiError);
    });
  });

  describe("error handling", () => {
    it("should convert validation errors to API errors", async () => {
      const invalidProps = {
        amount: -100,
        currency: "USD" as const,
        invoice: "test",
        externalId: 123,
        successCallbackUrl: "https://example.com",
        failureCallbackUrl: "https://example.com",
        successRedirectUrl: "https://example.com",
        failureRedirectUrl: "https://example.com",
      };

      try {
        await client.getPaymentLink(invalidProps);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(WhishPaymentApiError);
        expect((error as WhishPaymentApiError).code).toBe('VALIDATION_ERROR');
      }
    });

    it("should preserve WhishPaymentApiError instances", async () => {
      const customError = new WhishPaymentApiError("Custom error", 500);
      
      // Mock internal method to throw our custom error
      jest.spyOn(client as any, 'validateResponse').mockImplementation(() => {
        throw customError;
      });

      mockAxios.onGet(`${baseUrl}/payment/account/balance`).reply(200, {
        status: true,
        code: null,
        dialog: null,
        actions: null,
        extra: null,
        retrieved: true,
        data: { balance: 1000 },
      });

      try {
        await client.getBalance();
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBe(customError);
      }
    });
  });

  describe("environment configuration", () => {
    it("should use correct URLs for different environments", () => {
      const environments = [
        { env: 'development' as const, expectedUrl: 'https://lb.sandbox.whish.money/itel-service/api' },
        { env: 'production' as const, expectedUrl: 'https://whish.money/itel-service/api' },
      ];

      environments.forEach(({ env, expectedUrl }) => {
        const envClient = new WhishPaymentClient({
          ...validConfig,
          env,
        });
        expect(envClient.getUrl()).toBe(expectedUrl);
      });
    });
  });

  describe("supported currencies", () => {
    const supportedCurrencies = ['USD', 'LBP', 'AED'] as const;

    supportedCurrencies.forEach(currency => {
      it(`should accept ${currency} as valid currency`, async () => {
        const props = {
          amount: 100,
          currency,
          invoice: "Test",
          externalId: 123,
          successCallbackUrl: "https://example.com/success",
          failureCallbackUrl: "https://example.com/failure",
          successRedirectUrl: "https://example.com/success",
          failureRedirectUrl: "https://example.com/failure",
        };

        mockAxios.onPost(`${baseUrl}/payment/whish`).reply(200, {
          status: true,
          code: null,
          dialog: null,
          actions: null,
          extra: null,
          retrieved: true,
          data: { collectUrl: "https://example.com" },
        });

        await expect(client.getPaymentLink(props)).resolves.toBeDefined();
      });
    });
  });
});