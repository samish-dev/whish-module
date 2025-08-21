# API Reference

## Classes

### WhishPaymentClient

The main client class for interacting with the Whish Money API.

#### Constructor

```typescript
new WhishPaymentClient(config: WhishClientConfig)
```

Creates a new instance of the Whish Payment client.

**Parameters:**
- `config` - Configuration object containing authentication and environment details

**Example:**
```typescript
const client = new WhishPaymentClient({
  env: 'development',
  channel: 'your-channel-id',
  secret: 'your-secret-key',
  websiteUrl: 'https://yourwebsite.com',
  timeout: 30000,
  enableDebugLogging: false
});
```

#### Methods

##### `getBalance(): Promise<BalanceDetails>`

Retrieves the current account balance.

**Returns:** `Promise<BalanceDetails>`

**Throws:** `WhishPaymentApiError`

**Example:**
```typescript
try {
  const balance = await client.getBalance();
  console.log(`Available balance: $${balance.balance}`);
} catch (error) {
  console.error('Failed to get balance:', error.message);
}
```

##### `getPaymentLink(props: PaymentProps): Promise<PaymentDetails>`

Generates a payment link for collecting payments from customers.

**Parameters:**
- `props` - Payment properties including amount, currency, and callback URLs

**Returns:** `Promise<PaymentDetails>`

**Throws:** `WhishPaymentApiError`, `ValidationError`

**Example:**
```typescript
const payment = await client.getPaymentLink({
  amount: 150.00,
  currency: 'USD',
  invoice: 'Order #12345',
  externalId: 12345,
  successCallbackUrl: 'https://api.yoursite.com/payment/success',
  failureCallbackUrl: 'https://api.yoursite.com/payment/failure',
  successRedirectUrl: 'https://yoursite.com/order/success',
  failureRedirectUrl: 'https://yoursite.com/order/failed'
});
```

##### `getPaymentStatus(props: CollectStatusProps): Promise<CollectStatusDetails>`

Checks the status of a payment transaction.

**Parameters:**
- `props` - Status check properties including amount, currency, and external ID

**Returns:** `Promise<CollectStatusDetails>`

**Throws:** `WhishPaymentApiError`, `ValidationError`

**Example:**
```typescript
const status = await client.getPaymentStatus({
  amount: 150.00,
  currency: 'USD',
  externalId: 12345
});
console.log('Payment status:', status.collectStatus);
```

## Interfaces

### WhishClientConfig

Configuration interface for initializing the Whish Payment Client.

```typescript
interface WhishClientConfig {
  env: ENV_MODE;
  channel: string;
  secret: string;
  websiteUrl: string;
  timeout?: number;
  baseUrl?: string;
  enableDebugLogging?: boolean;
}
```

### PaymentProps

Properties required for creating a payment link.

```typescript
interface PaymentProps {
  amount: number;
  currency: Currency;
  invoice: string;
  externalId: number;
  successCallbackUrl: string;
  failureCallbackUrl: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}
```

### CollectStatusProps

Properties required for checking payment status.

```typescript
interface CollectStatusProps {
  amount: number;
  currency: Currency;
  externalId: number;
}
```

### BalanceDetails

Account balance information.

```typescript
interface BalanceDetails {
  balance: number;
}
```

### PaymentDetails

Payment link generation response.

```typescript
interface PaymentDetails {
  collectUrl: string;
}
```

### CollectStatusDetails

Payment status information.

```typescript
interface CollectStatusDetails {
  collectStatus: Status;
}
```

## Type Definitions

### Currency

Supported currencies for payment processing.

```typescript
type Currency = 'USD' | 'LBP' | 'AED';
```

### Status

Payment transaction status.

```typescript
type Status = 'success' | 'failed' | 'pending';
```

### ENV_MODE

Environment modes for API endpoints.

```typescript
type ENV_MODE = 'production' | 'development';
```

## Error Classes

### WhishPaymentApiError

Custom error class for Whish Payment API errors.

```typescript
class WhishPaymentApiError extends Error {
  readonly statusCode: number;
  readonly code: string | null;
  readonly details: unknown;
  readonly timestamp: Date;

  constructor(message: string, statusCode: number, code?: string | null, details?: unknown);

  isClientError(): boolean;
  isServerError(): boolean;
  isRetryable(): boolean;
  getUserFriendlyMessage(): string;
  toJSON(): object;
}
```

### ValidationError

Error thrown when input validation fails.

```typescript
class ValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string);
}
```

## Constants

### API Endpoints

- **Development:** `https://lb.sandbox.whish.money/itel-service/api`
- **Production:** `https://whish.money/itel-service/api`

### Supported Operations

- Get account balance
- Generate payment links
- Check payment status

### Rate Limits

The API has built-in rate limiting. The SDK includes automatic retry logic for rate-limited requests.

### Timeouts

- Default request timeout: 30,000ms (30 seconds)
- Configurable via `timeout` parameter in client configuration

## Best Practices

1. **Environment Management**: Use environment variables for sensitive configuration
2. **Error Handling**: Always wrap API calls in try-catch blocks
3. **Logging**: Enable debug logging during development, disable in production
4. **Validation**: The SDK includes comprehensive input validation
5. **Retry Logic**: The SDK includes automatic retry for transient failures
6. **Security**: Never expose API credentials in client-side code
