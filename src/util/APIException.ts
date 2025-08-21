/**
 * Custom error class for Whish Payment API errors
 *
 * @example
 * ```typescript
 * try {
 *   await client.getBalance();
 * } catch (error) {
 *   if (error instanceof WhishPaymentApiError) {
 *     console.error('API Error:', error.toJSON());
 *     console.error('Status Code:', error.statusCode);
 *     console.error('Error Code:', error.code);
 *   }
 * }
 * ```
 */
export class WhishPaymentApiError extends Error {
  /** HTTP status code of the error response */
  public readonly statusCode: number;
  /** API-specific error code (if available) */
  public readonly code: string | null;
  /** Additional error details (if available) */
  public readonly details: unknown;
  /** Timestamp when the error occurred */
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number,
    code: string | null = null,
    details: unknown = null
  ) {
    super(message);
    this.name = 'WhishPaymentApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WhishPaymentApiError);
    }
  }

  /**
   * Convert error to JSON format for logging or serialization
   *
   * @returns Object representation of the error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Check if error is a client error (4xx status codes)
   *
   * @returns true if status code is between 400-499
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx status codes)
   *
   * @returns true if status code is between 500-599
   */
  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * Check if error is retryable (typically server errors or specific client errors)
   *
   * @returns true if the request can be safely retried
   */
  isRetryable(): boolean {
    // Retry on server errors or specific client errors like rate limiting
    return (
      this.isServerError() ||
      this.statusCode === 408 || // Request Timeout
      this.statusCode === 429
    ); // Too Many Requests
  }

  /**
   * Get user-friendly error message based on status code
   *
   * @returns Human-readable error message
   */
  getUserFriendlyMessage(): string {
    switch (this.statusCode) {
      case 400:
        return 'Invalid request. Please check your payment details.';
      case 401:
        return 'Authentication failed. Please check your API credentials.';
      case 403:
        return 'Access denied. Please verify your permissions.';
      case 404:
        return 'Resource not found. Please check the request details.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait and try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }
}
