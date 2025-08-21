/**
 * Tests for validation utilities
 */

import {
  validatePositiveNumber,
  validateNonEmptyString,
  validateUrl,
  validateCurrency,
  validateIntegerId,
  validatePaymentProps,
  validateStatusProps,
  ValidationError,
} from '../src/util/validation';
import { PaymentProps, CollectStatusProps } from '../src/types';

describe('Validation Utilities', () => {
  describe('validatePositiveNumber', () => {
    it('should accept positive numbers', () => {
      expect(() => validatePositiveNumber(100, 'amount')).not.toThrow();
      expect(() => validatePositiveNumber(0.01, 'amount')).not.toThrow();
    });

    it('should reject zero', () => {
      expect(() => validatePositiveNumber(0, 'amount')).toThrow(ValidationError);
    });

    it('should reject negative numbers', () => {
      expect(() => validatePositiveNumber(-100, 'amount')).toThrow(ValidationError);
    });

    it('should reject non-numbers', () => {
      expect(() => validatePositiveNumber('100', 'amount')).toThrow(ValidationError);
      expect(() => validatePositiveNumber(null, 'amount')).toThrow(ValidationError);
    });

    it('should reject infinite values', () => {
      expect(() => validatePositiveNumber(Infinity, 'amount')).toThrow(ValidationError);
      expect(() => validatePositiveNumber(-Infinity, 'amount')).toThrow(ValidationError);
    });

    it('should reject NaN', () => {
      expect(() => validatePositiveNumber(NaN, 'amount')).toThrow(ValidationError);
    });
  });

  describe('validateNonEmptyString', () => {
    it('should accept non-empty strings', () => {
      expect(() => validateNonEmptyString('hello', 'field')).not.toThrow();
      expect(() => validateNonEmptyString('  valid  ', 'field')).not.toThrow();
    });

    it('should reject empty strings', () => {
      expect(() => validateNonEmptyString('', 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString('   ', 'field')).toThrow(ValidationError);
    });

    it('should reject non-strings', () => {
      expect(() => validateNonEmptyString(123, 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString(null, 'field')).toThrow(ValidationError);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid HTTP URLs', () => {
      expect(() => validateUrl('http://example.com', 'url')).not.toThrow();
      expect(() => validateUrl('https://example.com/path?query=1', 'url')).not.toThrow();
    });

    it('should reject invalid URLs', () => {
      expect(() => validateUrl('not-a-url', 'url')).toThrow(ValidationError);
      expect(() => validateUrl('ftp://example.com', 'url')).toThrow(ValidationError);
    });

    it('should reject empty strings', () => {
      expect(() => validateUrl('', 'url')).toThrow(ValidationError);
    });
  });

  describe('validateCurrency', () => {
    it('should accept valid currencies', () => {
      expect(() => validateCurrency('USD', 'currency')).not.toThrow();
      expect(() => validateCurrency('LBP', 'currency')).not.toThrow();
      expect(() => validateCurrency('AED', 'currency')).not.toThrow();
    });

    it('should reject invalid currencies', () => {
      expect(() => validateCurrency('EUR', 'currency')).toThrow(ValidationError);
      expect(() => validateCurrency('invalid', 'currency')).toThrow(ValidationError);
    });
  });

  describe('validateIntegerId', () => {
    it('should accept positive integers', () => {
      expect(() => validateIntegerId(1, 'id')).not.toThrow();
      expect(() => validateIntegerId(12345, 'id')).not.toThrow();
    });

    it('should reject zero and negative numbers', () => {
      expect(() => validateIntegerId(0, 'id')).toThrow(ValidationError);
      expect(() => validateIntegerId(-1, 'id')).toThrow(ValidationError);
    });

    it('should reject non-integers', () => {
      expect(() => validateIntegerId(1.5, 'id')).toThrow(ValidationError);
      expect(() => validateIntegerId('123', 'id')).toThrow(ValidationError);
    });
  });

  describe('validatePaymentProps', () => {
    const validProps: PaymentProps = {
      amount: 100,
      currency: 'USD',
      invoice: 'Test Invoice',
      externalId: 12345,
      successCallbackUrl: 'https://example.com/success',
      failureCallbackUrl: 'https://example.com/failure',
      successRedirectUrl: 'https://example.com/success',
      failureRedirectUrl: 'https://example.com/failure',
    };

    it('should accept valid payment props', () => {
      expect(() => validatePaymentProps(validProps)).not.toThrow();
    });

    it('should reject excessive amounts', () => {
      const invalidProps = { ...validProps, amount: 1000001 };
      expect(() => validatePaymentProps(invalidProps)).toThrow(ValidationError);
    });

    it('should reject long invoices', () => {
      const invalidProps = { ...validProps, invoice: 'x'.repeat(256) };
      expect(() => validatePaymentProps(invalidProps)).toThrow(ValidationError);
    });
  });

  describe('validateStatusProps', () => {
    const validProps: CollectStatusProps = {
      amount: 100,
      currency: 'USD',
      externalId: 12345,
    };

    it('should accept valid status props', () => {
      expect(() => validateStatusProps(validProps)).not.toThrow();
    });

    it('should reject invalid props', () => {
      const invalidProps = { ...validProps, amount: -100 };
      expect(() => validateStatusProps(invalidProps)).toThrow(ValidationError);
    });
  });

  describe('ValidationError', () => {
    it('should include field information', () => {
      const error = new ValidationError('amount', 'must be positive');
      expect(error.field).toBe('amount');
      expect(error.message).toContain('amount');
      expect(error.message).toContain('must be positive');
    });

    it('should have correct name', () => {
      const error = new ValidationError('field', 'message');
      expect(error.name).toBe('ValidationError');
    });
  });
});
