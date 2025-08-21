/**
 * HTTP client utility with retry logic and enhanced error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { WhishPaymentApiError } from './APIException';
import { logger } from './logger';

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay between retries in milliseconds */
  baseDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
}

export interface HttpClientConfig {
  /** Base URL for API requests */
  baseURL: string;
  /** Default headers for all requests */
  headers: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Retry configuration */
  retry: RetryConfig;
}

/**
 * Enhanced HTTP client with retry logic and error handling
 */
export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly retryConfig: RetryConfig;

  constructor(config: HttpClientConfig) {
    this.retryConfig = config.retry;

    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: config.headers,
      timeout: config.timeout,
    });

    this.setupInterceptors();
  }

  /**
   * Performs GET request with retry logic
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.requestWithRetry<T>(() => this.axiosInstance.get<T>(url, config));
  }

  /**
   * Performs POST request with retry logic
   */
  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.requestWithRetry<T>(() => this.axiosInstance.post<T>(url, data, config));
  }

  /**
   * Generic request method with retry logic
   */
  private async requestWithRetry<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<T> {
    let lastError: AxiosError | Error | undefined;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await requestFn();

        if (attempt > 0) {
          logger.info('Request succeeded after retry', { attempt });
        }

        return response.data;
      } catch (error) {
        lastError = error as AxiosError | Error;

        // Don't retry on the last attempt
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          break;
        }

        const delay = this.calculateDelay(attempt);
        logger.warn('Request failed, retrying', {
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries,
          delayMs: delay,
          error: lastError.message,
        });

        await this.sleep(delay);
      }
    }

    // If we get here, all retries failed
    throw this.convertToApiError(lastError!);
  }

  /**
   * Determines if an error is retryable
   */
  private isRetryableError(error: AxiosError | Error): boolean {
    if (axios.isAxiosError(error)) {
      // Network errors
      if (!error.response) {
        return true;
      }

      // Server errors and specific client errors
      const status = error.response.status;
      return status >= 500 || status === 408 || status === 429;
    }

    // Non-axios errors are generally not retryable
    return false;
  }

  /**
   * Calculates delay for next retry attempt using exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay =
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;

    return Math.min(exponentialDelay + jitter, this.retryConfig.maxDelay);
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Converts various error types to WhishPaymentApiError
   */
  private convertToApiError(error: AxiosError | Error): WhishPaymentApiError {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorData = (error.response?.data as Record<string, unknown>) || {};

      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        return new WhishPaymentApiError('Request timeout', 408, 'TIMEOUT');
      }

      // Handle network errors
      if (['ENOTFOUND', 'ECONNREFUSED', 'ENETUNREACH'].includes(error.code || '')) {
        return new WhishPaymentApiError(
          'Network error: Unable to connect to Whish API',
          503,
          'NETWORK_ERROR'
        );
      }

      return new WhishPaymentApiError(
        (errorData.message as string) || error.message || 'Unknown API error occurred',
        statusCode,
        (errorData.code as string) || error.code || null,
        errorData.details || null
      );
    }

    return new WhishPaymentApiError(error.message, 500);
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      config => {
        logger.debug('Making HTTP request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
        });
        return config;
      },
      error => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and validation
    this.axiosInstance.interceptors.response.use(
      response => {
        logger.debug('Received HTTP response', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
        });
        return response;
      },
      error => {
        if (axios.isAxiosError(error)) {
          logger.error('HTTP request failed', error, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
          });
        }
        return Promise.reject(error);
      }
    );
  }
}
