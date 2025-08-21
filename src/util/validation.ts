/**
 * Input validation utilities for Whish Payment SDK
 */

import { Currency, PaymentProps, CollectStatusProps } from '../types';

/**
 * Validation error with field-specific context
 */
export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(`Validation error for field '${field}': ${message}`);
    this.name = 'ValidationError';
  }
}

/**
 * Validates if a value is a positive number
 */
export function validatePositiveNumber(value: unknown, fieldName: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new ValidationError(fieldName, 'must be a positive finite number');
  }
}

/**
 * Validates if a value is a non-empty string
 */
export function validateNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(fieldName, 'must be a non-empty string');
  }
}

/**
 * Validates if a value is a valid URL
 */
export function validateUrl(value: unknown, fieldName: string): asserts value is string {
  validateNonEmptyString(value, fieldName);

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new ValidationError(fieldName, 'must use HTTP or HTTPS protocol');
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(fieldName, 'must be a valid URL');
  }
}

/**
 * Validates if a value is a supported currency
 */
export function validateCurrency(value: unknown, fieldName: string): asserts value is Currency {
  const validCurrencies: Currency[] = ['USD', 'LBP', 'AED'];

  if (!validCurrencies.includes(value as Currency)) {
    throw new ValidationError(fieldName, `must be one of: ${validCurrencies.join(', ')}`);
  }
}

/**
 * Validates if a value is a valid integer ID
 */
export function validateIntegerId(value: unknown, fieldName: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new ValidationError(fieldName, 'must be a positive integer');
  }
}

/**
 * Validates payment properties comprehensively
 */
export function validatePaymentProps(props: PaymentProps): void {
  validatePositiveNumber(props.amount, 'amount');
  validateCurrency(props.currency, 'currency');
  validateNonEmptyString(props.invoice, 'invoice');
  validateIntegerId(props.externalId, 'externalId');
  validateUrl(props.successCallbackUrl, 'successCallbackUrl');
  validateUrl(props.failureCallbackUrl, 'failureCallbackUrl');
  validateUrl(props.successRedirectUrl, 'successRedirectUrl');
  validateUrl(props.failureRedirectUrl, 'failureRedirectUrl');

  // Additional business logic validations
  if (props.amount > 1000000) {
    throw new ValidationError('amount', 'cannot exceed 1,000,000');
  }

  if (props.invoice.length > 255) {
    throw new ValidationError('invoice', 'cannot exceed 255 characters');
  }
}

/**
 * Validates status check properties
 */
export function validateStatusProps(props: CollectStatusProps): void {
  validatePositiveNumber(props.amount, 'amount');
  validateCurrency(props.currency, 'currency');
  validateIntegerId(props.externalId, 'externalId');
}
