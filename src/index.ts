import {
  BalanceDetails,
  CollectStatusDetails,
  CollectStatusProps,
  ENV_MODE,
  PaymentDetails,
  PaymentProps,
  WhishResponse,
} from './types';
import { WhishPaymentApiError } from './util/APIException';
import { HttpClient, HttpClientConfig } from './util/http-client';
import { logger, LogLevel, Logger } from './util/logger';
import { validatePaymentProps, validateStatusProps, ValidationError } from './util/validation';

/**
 * Configuration interface for the Whish Payment Client
 */
export interface WhishClientConfig {
  /** Environment mode - 'development' for testing, 'production' for live transactions */
  env: ENV_MODE;
  /** Your Whish channel identifier provided by Whish Money */
  channel: string;
  /** Your secret key provided by Whish Money */
  secret: string;
  /** Your registered website URL with Whish Money */
  websiteUrl: string;
  /** Optional timeout for API requests in milliseconds (default: 30000) */
  timeout?: number;
  /** Optional custom base URL (overrides environment-based URL) */
  baseUrl?: string;
  /** Optional logging configuration */
  enableDebugLogging?: boolean;
}

/**
 * Whish Payment Client for interacting with Whish Money API
 *
 * @example
 * ```typescript
 * import WhishPaymentClient from 'whish-payment';
 *
 * const client = new WhishPaymentClient({
 *   env: 'development',
 *   channel: 'your-channel',
 *   secret: 'your-secret',
 *   websiteUrl: 'https://yourwebsite.com'
 * });
 *
 * const balance = await client.getBalance();
 * console.log('Current balance:', balance.balance);
 * ```
 */
export default class WhishPaymentClient {
  private readonly httpClient: HttpClient;
  private readonly baseUrl: string;

  constructor(config: WhishClientConfig) {
    this.validateConfig(config);

    // Configure logging if debug is enabled
    if (config.enableDebugLogging) {
      Logger.configure([LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]);
    }

    this.baseUrl = config.baseUrl || this.getEnvironmentUrl(config.env);

    // Initialize HTTP client with retry configuration
    const httpConfig: HttpClientConfig = {
      baseURL: this.baseUrl,
      headers: {
        channel: config.channel,
        secret: config.secret,
        websiteurl: config.websiteUrl,
        'Content-Type': 'application/json',
        'User-Agent': 'whish-payment-node/1.0.3',
      },
      timeout: config.timeout || 30000,
      retry: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      },
    };

    this.httpClient = new HttpClient(httpConfig);

    logger.info('Whish Payment Client initialized', {
      env: config.env,
      baseUrl: this.baseUrl,
      timeout: config.timeout || 30000,
    });
  }

  /**
   * Get the current account balance
   *
   * @returns Promise<BalanceDetails> The account balance information
   * @throws {WhishPaymentApiError} When the API request fails
   *
   * @example
   * ```typescript
   * try {
   *   const balance = await client.getBalance();
   *   console.log(`Your balance is: ${balance.balance}`);
   * } catch (error) {
   *   if (error instanceof WhishPaymentApiError) {
   *     console.error('API Error:', error.message);
   *   }
   * }
   * ```
   */
  async getBalance(): Promise<BalanceDetails> {
    try {
      logger.debug('Fetching account balance');

      const response = await this.httpClient.get<WhishResponse<BalanceDetails>>(
        '/payment/account/balance'
      );

      this.validateResponse(response);

      logger.info('Successfully fetched account balance', {
        balance: response.data.balance,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch account balance', error as Error);
      this.handleError(error);
    }
  }

  /**
   * Generate a payment link for collecting payments
   *
   * @param props Payment properties including amount, currency, and callback URLs
   * @returns Promise<PaymentDetails> The payment link details
   * @throws {WhishPaymentApiError} When the API request fails or validation errors occur
   *
   * @example
   * ```typescript
   * const paymentRequest = {
   *   amount: 100,
   *   currency: 'USD',
   *   invoice: 'INV-001',
   *   externalId: 123456,
   *   successCallbackUrl: 'https://yoursite.com/success',
   *   failureCallbackUrl: 'https://yoursite.com/failure',
   *   successRedirectUrl: 'https://yoursite.com/thank-you',
   *   failureRedirectUrl: 'https://yoursite.com/error'
   * };
   *
   * const payment = await client.getPaymentLink(paymentRequest);
   * console.log('Payment URL:', payment.collectUrl);
   * ```
   */
  async getPaymentLink(props: PaymentProps): Promise<PaymentDetails> {
    try {
      logger.debug('Creating payment link', {
        amount: props.amount,
        currency: props.currency,
        externalId: props.externalId,
      });

      validatePaymentProps(props);

      const response = await this.httpClient.post<WhishResponse<PaymentDetails>>(
        '/payment/whish',
        props
      );

      this.validateResponse(response);

      logger.info('Successfully created payment link', {
        externalId: props.externalId,
        amount: props.amount,
        currency: props.currency,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create payment link', error as Error, {
        externalId: props.externalId,
        amount: props.amount,
      });
      this.handleError(error);
    }
  }

  /**
   * Check the status of a payment transaction
   *
   * @param props Status check properties including amount, currency, and external ID
   * @returns Promise<CollectStatusDetails> The payment status information
   * @throws {WhishPaymentApiError} When the API request fails
   *
   * @example
   * ```typescript
   * const statusRequest = {
   *   amount: 100,
   *   currency: 'USD',
   *   externalId: 123456
   * };
   *
   * const status = await client.getPaymentStatus(statusRequest);
   * console.log('Payment status:', status.collectStatus);
   * ```
   */
  async getPaymentStatus(props: CollectStatusProps): Promise<CollectStatusDetails> {
    try {
      logger.debug('Checking payment status', {
        externalId: props.externalId,
        amount: props.amount,
        currency: props.currency,
      });

      validateStatusProps(props);

      const response = await this.httpClient.post<WhishResponse<CollectStatusDetails>>(
        '/payment/collect/status',
        props
      );

      this.validateResponse(response);

      logger.info('Successfully checked payment status', {
        externalId: props.externalId,
        status: response.data.collectStatus,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to check payment status', error as Error, {
        externalId: props.externalId,
      });
      this.handleError(error);
    }
  }

  /**
   * Get the base URL for the specified environment
   * This method is public to allow testing
   *
   * @returns string The base URL for API requests
   */
  public getUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get environment-specific URL
   */
  private getEnvironmentUrl(env: ENV_MODE): string {
    switch (env) {
      case 'development':
        return 'https://lb.sandbox.whish.money/itel-service/api';
      case 'production':
        return 'https://whish.money/itel-service/api';
      default:
        throw new WhishPaymentApiError(`Invalid environment: ${env}`, 400);
    }
  }

  /**
   * Validate client configuration
   */
  private validateConfig(config: WhishClientConfig): void {
    if (!config.channel || typeof config.channel !== 'string') {
      throw new WhishPaymentApiError('Channel is required and must be a string', 400);
    }
    if (!config.secret || typeof config.secret !== 'string') {
      throw new WhishPaymentApiError('Secret is required and must be a string', 400);
    }
    if (!config.websiteUrl || typeof config.websiteUrl !== 'string') {
      throw new WhishPaymentApiError('Website URL is required and must be a string', 400);
    }
    if (!config.env || !['development', 'production'].includes(config.env)) {
      throw new WhishPaymentApiError(
        'Environment must be either "development" or "production"',
        400
      );
    }
    if (config.timeout && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
      throw new WhishPaymentApiError('Timeout must be a positive number', 400);
    }
  }

  /**
   * Validate API response
   */
  private validateResponse<T>(response: WhishResponse<T>): void {
    if (!response || typeof response.status !== 'boolean') {
      throw new WhishPaymentApiError('Invalid response format from API', 500);
    }
    if (!response.status) {
      throw new WhishPaymentApiError(response.code || 'API request failed', 500, response.code);
    }
  }

  /**
   * Handle and convert errors to appropriate API errors
   */
  private handleError(error: unknown): never {
    if (error instanceof ValidationError) {
      throw new WhishPaymentApiError(error.message, 400, 'VALIDATION_ERROR');
    }

    if (error instanceof WhishPaymentApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new WhishPaymentApiError(error.message, 500);
    }

    throw new WhishPaymentApiError('Unexpected error occurred', 500);
  }
}

// Export types for consumers
export * from './types/index';
export { WhishPaymentApiError } from './util/APIException';
export { ValidationError } from './util/validation';
export { Logger, LogLevel } from './util/logger';
