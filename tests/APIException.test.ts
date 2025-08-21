/**
 * Tests for error handling utilities
 */

import { WhishPaymentApiError } from '../src/util/APIException';

describe('WhishPaymentApiError', () => {
  describe('constructor', () => {
    it('should create error with basic properties', () => {
      const error = new WhishPaymentApiError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBeNull();
      expect(error.details).toBeNull();
      expect(error.name).toBe('WhishPaymentApiError');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create error with all properties', () => {
      const details = { field: 'amount', value: -100 };
      const error = new WhishPaymentApiError('Test error', 400, 'VALIDATION_ERROR', details);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toBe(details);
    });
  });

  describe('status code helpers', () => {
    it('should identify client errors', () => {
      const error400 = new WhishPaymentApiError('Bad Request', 400);
      const error404 = new WhishPaymentApiError('Not Found', 404);
      const error500 = new WhishPaymentApiError('Server Error', 500);
      
      expect(error400.isClientError()).toBe(true);
      expect(error404.isClientError()).toBe(true);
      expect(error500.isClientError()).toBe(false);
    });

    it('should identify server errors', () => {
      const error400 = new WhishPaymentApiError('Bad Request', 400);
      const error500 = new WhishPaymentApiError('Server Error', 500);
      const error503 = new WhishPaymentApiError('Service Unavailable', 503);
      
      expect(error400.isServerError()).toBe(false);
      expect(error500.isServerError()).toBe(true);
      expect(error503.isServerError()).toBe(true);
    });

    it('should identify retryable errors', () => {
      const error400 = new WhishPaymentApiError('Bad Request', 400);
      const error408 = new WhishPaymentApiError('Timeout', 408);
      const error429 = new WhishPaymentApiError('Rate Limited', 429);
      const error500 = new WhishPaymentApiError('Server Error', 500);
      const error503 = new WhishPaymentApiError('Service Unavailable', 503);
      
      expect(error400.isRetryable()).toBe(false);
      expect(error408.isRetryable()).toBe(true);
      expect(error429.isRetryable()).toBe(true);
      expect(error500.isRetryable()).toBe(true);
      expect(error503.isRetryable()).toBe(true);
    });
  });

  describe('user-friendly messages', () => {
    const testCases = [
      { status: 400, expected: 'Invalid request. Please check your payment details.' },
      { status: 401, expected: 'Authentication failed. Please check your API credentials.' },
      { status: 403, expected: 'Access denied. Please verify your permissions.' },
      { status: 404, expected: 'Resource not found. Please check the request details.' },
      { status: 408, expected: 'Request timeout. Please try again.' },
      { status: 429, expected: 'Too many requests. Please wait and try again later.' },
      { status: 500, expected: 'Internal server error. Please try again later.' },
      { status: 503, expected: 'Service temporarily unavailable. Please try again later.' },
      { status: 418, expected: 'Custom message' }, // Fallback case
    ];

    testCases.forEach(({ status, expected }) => {
      it(`should return correct message for status ${status}`, () => {
        const message = status === 418 ? 'Custom message' : 'Original message';
        const error = new WhishPaymentApiError(message, status);
        
        if (status === 418) {
          expect(error.getUserFriendlyMessage()).toBe('Custom message');
        } else {
          expect(error.getUserFriendlyMessage()).toBe(expected);
        }
      });
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const details = { field: 'amount' };
      const error = new WhishPaymentApiError('Test error', 400, 'TEST_CODE', details);
      const json = error.toJSON();
      
      expect(json.name).toBe('WhishPaymentApiError');
      expect(json.message).toBe('Test error');
      expect(json.statusCode).toBe(400);
      expect(json.code).toBe('TEST_CODE');
      expect(json.details).toBe(details);
      expect(json.timestamp).toBe(error.timestamp.toISOString());
      expect(json.stack).toBe(error.stack);
    });
  });

  describe('error inheritance', () => {
    it('should be instance of Error', () => {
      const error = new WhishPaymentApiError('Test', 400);
      expect(error).toBeInstanceOf(Error);
    });

    it('should maintain stack trace', () => {
      const error = new WhishPaymentApiError('Test', 400);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('WhishPaymentApiError');
    });
  });
});
