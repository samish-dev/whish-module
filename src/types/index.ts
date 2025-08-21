/**
 * Whish Payment API Types and Interfaces
 *
 * This module contains all TypeScript type definitions for the Whish Payment SDK.
 * It provides strongly-typed interfaces for API requests, responses, and configuration.
 *
 * @packageDocumentation
 */

/**
 * Standard API response wrapper from Whish Money API
 *
 * All API endpoints return data wrapped in this standard format.
 *
 * @template T The type of the actual response data
 */
export interface WhishResponse<T> {
  /** Indicates if the request was successful */
  status: boolean;
  /** API response code (null if successful, error code if failed) */
  code: string | null;
  /** Dialog information (typically null, reserved for future use) */
  dialog: null;
  /** Available actions (typically null, reserved for future use) */
  actions: null;
  /** Extra metadata (typically null, reserved for future use) */
  extra: null;
  /** Indicates if data was retrieved successfully */
  retrieved: boolean;
  /** The actual response data */
  data: T;
}

/**
 * Account balance information
 *
 * Contains the current available balance in the account.
 */
export interface BalanceDetails {
  /** Current account balance in the account's base currency */
  balance: number;
}

/**
 * Payment link generation response
 *
 * Contains the URL where customers can complete their payment.
 */
export interface PaymentDetails {
  /** URL for payment collection that should be provided to the customer */
  collectUrl: string;
}

/**
 * Payment status information
 *
 * Contains the current status of a payment transaction.
 */
export interface CollectStatusDetails {
  /** Current status of the payment transaction */
  collectStatus: Status;
}

/**
 * Supported currencies for payment processing
 *
 * Only these three currencies are currently supported by the Whish Money API.
 */
export type Currency = 'USD' | 'LBP' | 'AED';

/**
 * Payment transaction status
 *
 * Represents the various states a payment can be in during its lifecycle.
 */
export type Status = 'success' | 'failed' | 'pending';

/**
 * Environment modes for API endpoints
 *
 * - 'development': Use sandbox environment for testing
 * - 'production': Use live environment for real transactions
 */
export type ENV_MODE = 'production' | 'development';

/**
 * Properties required for creating a payment link
 *
 * All fields are required for successful payment link generation.
 *
 * @example
 * ```typescript
 * const paymentProps: PaymentProps = {
 *   amount: 100.50,
 *   currency: 'USD',
 *   invoice: 'Order #12345',
 *   externalId: 12345,
 *   successCallbackUrl: 'https://api.mysite.com/payment/success',
 *   failureCallbackUrl: 'https://api.mysite.com/payment/failure',
 *   successRedirectUrl: 'https://mysite.com/thank-you',
 *   failureRedirectUrl: 'https://mysite.com/payment-failed'
 * };
 * ```
 */
export interface PaymentProps {
  /**
   * Payment amount (must be positive)
   *
   * The amount should be in the smallest unit of the currency
   * (e.g., cents for USD, fils for AED).
   */
  amount: number;

  /**
   * Currency code (USD, LBP, or AED)
   *
   * Must be one of the supported currencies.
   */
  currency: Currency;

  /**
   * Invoice description or number
   *
   * This will be displayed to the customer during payment.
   * Maximum length: 255 characters.
   */
  invoice: string;

  /**
   * Your unique transaction identifier
   *
   * This should be unique across all your transactions.
   * Used for tracking and status checks.
   */
  externalId: number;

  /**
   * URL to call when payment succeeds (webhook)
   *
   * Whish will POST to this URL when the payment is successful.
   * Must be a valid HTTPS URL accessible from the internet.
   */
  successCallbackUrl: string;

  /**
   * URL to call when payment fails (webhook)
   *
   * Whish will POST to this URL when the payment fails.
   * Must be a valid HTTPS URL accessible from the internet.
   */
  failureCallbackUrl: string;

  /**
   * URL to redirect user after successful payment
   *
   * The customer will be redirected here after completing payment successfully.
   * This should be a user-friendly page on your website.
   */
  successRedirectUrl: string;

  /**
   * URL to redirect user after failed payment
   *
   * The customer will be redirected here if the payment fails.
   * This should be a user-friendly error page on your website.
   */
  failureRedirectUrl: string;
}

/**
 * Properties required for checking payment status
 *
 * All fields must match exactly with the original payment request.
 *
 * @example
 * ```typescript
 * const statusProps: CollectStatusProps = {
 *   amount: 100.50,
 *   currency: 'USD',
 *   externalId: 12345
 * };
 * ```
 */
export interface CollectStatusProps {
  /**
   * Payment amount (must match original payment exactly)
   *
   * This must be the exact same amount used in the original payment request.
   */
  amount: number;

  /**
   * Currency code (must match original payment exactly)
   *
   * This must be the exact same currency used in the original payment request.
   */
  currency: Currency;

  /**
   * Your unique transaction identifier (must match original payment exactly)
   *
   * This must be the exact same externalId used in the original payment request.
   */
  externalId: number;
}

/**
 * Configuration for WhishPaymentClient constructor
 *
 * Contains all the necessary configuration to initialize the SDK client.
 *
 * @example
 * ```typescript
 * const config: WhishClientConfig = {
 *   env: 'development',
 *   channel: 'your-channel-id',
 *   secret: 'your-secret-key',
 *   websiteUrl: 'https://yourwebsite.com',
 *   timeout: 30000,
 *   enableDebugLogging: true
 * };
 * ```
 */
export interface WhishClientConfig {
  /**
   * Environment: 'development' for sandbox, 'production' for live
   *
   * Use 'development' for testing and 'production' for live transactions.
   */
  env: ENV_MODE;

  /**
   * Your Whish channel identifier
   *
   * This is provided by Whish Money when you register your integration.
   */
  channel: string;

  /**
   * Your secret API key
   *
   * This is provided by Whish Money when you register your integration.
   * Keep this secret and never expose it in client-side code.
   */
  secret: string;

  /**
   * Your registered website URL
   *
   * This must match the URL registered with Whish Money for your integration.
   */
  websiteUrl: string;

  /**
   * Request timeout in milliseconds (optional, default: 30000)
   *
   * How long to wait for API responses before timing out.
   */
  timeout?: number;

  /**
   * Custom API base URL (optional, overrides environment URL)
   *
   * Only use this if you need to point to a custom Whish API endpoint.
   * In most cases, leave this undefined to use the default URLs.
   */
  baseUrl?: string;

  /**
   * Enable debug logging (optional, default: false)
   *
   * When true, the SDK will log detailed information about requests and responses.
   * Useful for debugging but should be disabled in production.
   */
  enableDebugLogging?: boolean;
}

/**
 * Re-export commonly used types for convenience
 */
export { WhishPaymentApiError } from '../util/APIException';
export { ValidationError } from '../util/validation';
