# Whish Payment SDK

[![npm version](https://badge.fury.io/js/whish-payment.svg)](https://badge.fury.io/js/whish-payment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/samish-dev/whish-module/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/samish-dev/whish-module/actions)
[![Coverage Status](https://codecov.io/gh/samish-dev/whish-module/branch/main/graph/badge.svg)](https://codecov.io/gh/samish-dev/whish-module)

The **Whish Payment Node.js SDK** provides convenient access to the Whish Money API from applications written in server-side JavaScript/TypeScript. This SDK simplifies payment processing, balance checking, and transaction status monitoring with robust error handling, automatic retries, and comprehensive validation.

## ✨ Key Features

- 🔐 **Secure Authentication** - Built-in API key management with secure headers
- 💳 **Payment Processing** - Generate payment links and collect payments seamlessly
- 📊 **Balance Management** - Real-time account balance checking
- 🔍 **Transaction Tracking** - Monitor payment statuses with detailed information
- 🛡️ **Robust Error Handling** - Comprehensive error handling with custom error types
- 🔄 **Automatic Retries** - Smart retry logic for transient failures
- 📝 **TypeScript Support** - Full TypeScript definitions with excellent IDE support
- ⚡ **Input Validation** - Built-in request validation with helpful error messages
- 🌐 **Environment Support** - Separate development and production environments
- 📱 **Modern Architecture** - Built with modern JavaScript/TypeScript best practices
- 🧪 **Thoroughly Tested** - Comprehensive test suite with >70% coverage
- 📚 **Excellent Documentation** - Complete API reference and practical examples

## 📦 Installation

Install the package using npm:

```bash
npm install whish-payment
```

Or using yarn:

```bash
yarn add whish-payment
```

## 🚀 Quick Start

```typescript
import WhishPaymentClient from 'whish-payment';

// Initialize the client
const whishClient = new WhishPaymentClient({
  env: 'development', // or 'production'
  channel: 'your-channel-id',
  secret: 'your-secret-key',
  websiteUrl: 'https://yourwebsite.com'
});

// Get account balance
const balance = await whishClient.getBalance();
console.log('Current balance:', balance.balance);

// Create a payment link
const payment = await whishClient.getPaymentLink({
  amount: 100,
  currency: 'USD',
  invoice: 'Invoice #001',
  externalId: 12345,
  successCallbackUrl: 'https://yoursite.com/api/payment/success',
  failureCallbackUrl: 'https://yoursite.com/api/payment/failure',
  successRedirectUrl: 'https://yoursite.com/payment/success',
  failureRedirectUrl: 'https://yoursite.com/payment/error'
});

console.log('Payment URL:', payment.collectUrl);
```

## 🔧 Configuration

### Client Configuration Options

```typescript
interface WhishClientConfig {
  env: 'development' | 'production';    // Environment mode
  channel: string;                      // Your Whish channel ID
  secret: string;                       // Your secret API key
  websiteUrl: string;                   // Your registered website URL
  timeout?: number;                     // Request timeout (default: 30000ms)
  baseUrl?: string;                     // Custom API base URL (optional)
  enableDebugLogging?: boolean;         // Enable debug logging (default: false)
}
```

### Getting API Credentials

To obtain your API credentials (`channel`, `secret`, and register your `websiteUrl`):

1. Contact Whish Money support team
2. Provide your business information and website details
3. You'll receive your credentials via email
4. Use development credentials for testing and production credentials for live transactions

## 📖 API Reference

### WhishPaymentClient

#### Methods

### `getBalance(): Promise<BalanceDetails>`

Retrieves the current account balance.

**Returns:**
```typescript
interface BalanceDetails {
  balance: number;
}
```

**Example:**
```typescript
try {
  const balance = await client.getBalance();
  console.log(`Available balance: $${balance.balance}`);
} catch (error) {
  if (error instanceof WhishPaymentApiError) {
    console.error('Failed to get balance:', error.getUserFriendlyMessage());
  }
}
```

### `getPaymentLink(props: PaymentProps): Promise<PaymentDetails>`

Generates a payment link for collecting payments from customers.

**Parameters:**
```typescript
interface PaymentProps {
  amount: number;                    // Payment amount (positive number)
  currency: 'USD' | 'LBP' | 'AED';  // Currency code
  invoice: string;                   // Invoice description/number
  externalId: number;                // Your unique transaction ID
  successCallbackUrl: string;        // Webhook URL for successful payments
  failureCallbackUrl: string;        // Webhook URL for failed payments
  successRedirectUrl: string;        // User redirect URL after success
  failureRedirectUrl: string;        // User redirect URL after failure
}
```

**Returns:**
```typescript
interface PaymentDetails {
  collectUrl: string; // URL to redirect customer for payment
}
```

**Example:**
```typescript
const paymentRequest = {
  amount: 150.00,
  currency: 'USD',
  invoice: 'Order #12345',
  externalId: 12345,
  successCallbackUrl: 'https://api.yoursite.com/webhooks/payment/success',
  failureCallbackUrl: 'https://api.yoursite.com/webhooks/payment/failure',
  successRedirectUrl: 'https://yoursite.com/order/success',
  failureRedirectUrl: 'https://yoursite.com/order/failed'
};

const payment = await client.getPaymentLink(paymentRequest);
// Redirect customer to: payment.collectUrl
```

### `getPaymentStatus(props: CollectStatusProps): Promise<CollectStatusDetails>`

Checks the status of a payment transaction.

**Parameters:**
```typescript
interface CollectStatusProps {
  amount: number;      // Payment amount (must match original)
  currency: Currency;  // Currency (must match original)
  externalId: number;  // Transaction ID (must match original)
}
```

**Returns:**
```typescript
interface CollectStatusDetails {
  collectStatus: 'success' | 'failed' | 'pending';
}
```

**Example:**
```typescript
const statusCheck = {
  amount: 150.00,
  currency: 'USD',
  externalId: 12345
};

const status = await client.getPaymentStatus(statusCheck);
console.log('Payment status:', status.collectStatus);
```

## 🚨 Error Handling

The SDK uses a custom `WhishPaymentApiError` class for all API-related errors with enhanced functionality.

### WhishPaymentApiError Features

```typescript
class WhishPaymentApiError extends Error {
  statusCode: number;        // HTTP status code
  code: string | null;       // API error code
  details: unknown;          // Additional error details
  timestamp: Date;           // When the error occurred

  // Error analysis methods
  isClientError(): boolean;      // 4xx errors
  isServerError(): boolean;      // 5xx errors
  isRetryable(): boolean;        // Whether safe to retry
  getUserFriendlyMessage(): string; // Human-readable message
  toJSON(): object;              // Serialize for logging
}
```

### Advanced Error Handling Example

```typescript
import { WhishPaymentApiError, ValidationError } from 'whish-payment';

try {
  const payment = await client.getPaymentLink(paymentData);
  // Process successful payment
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed for ${error.field}: ${error.message}`);
  } else if (error instanceof WhishPaymentApiError) {
    console.error('API Error Details:', error.toJSON());
    
    // Handle specific error types
    if (error.isClientError()) {
      console.error('Client error - check your request data');
    } else if (error.isServerError()) {
      console.error('Server error - try again later');
    }
    
    // Check if error is retryable
    if (error.isRetryable()) {
      console.log('This error can be retried');
      // Implement your retry logic here
    }
    
    // Get user-friendly message
    console.error('User message:', error.getUserFriendlyMessage());
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🔄 Automatic Retry Logic

The SDK includes intelligent retry logic for transient failures:

- **Network timeouts** (408)
- **Rate limiting** (429)
- **Server errors** (5xx)

**Features:**
- Exponential backoff with jitter
- Configurable retry attempts (default: 3)
- Smart error detection

## 🧪 Testing

### Development Environment

For testing purposes, use the development environment:

```typescript
const client = new WhishPaymentClient({
  env: 'development',
  // ... other config
});
```

### Test Payment Data

In development mode, use these test values:

**Successful Payment:**
- Phone number: `96170902894`
- OTP: `111111`

**Failed Payment:**
- Phone number: any other number
- OTP: `111111`

### Running Tests

```bash
# Run the test suite
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests in CI mode
npm run test:ci
```

## 🎯 Best Practices

### 1. Environment Management

```typescript
// Use environment variables for configuration
const client = new WhishPaymentClient({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  channel: process.env.WHISH_CHANNEL!,
  secret: process.env.WHISH_SECRET!,
  websiteUrl: process.env.WHISH_WEBSITE_URL!,
  enableDebugLogging: process.env.NODE_ENV === 'development'
});
```

### 2. Robust Error Handling

```typescript
async function processPayment(paymentData: PaymentProps) {
  try {
    const payment = await client.getPaymentLink(paymentData);
    return { success: true, paymentUrl: payment.collectUrl };
  } catch (error) {
    if (error instanceof WhishPaymentApiError) {
      // Log error details for debugging
      console.error('Payment API Error:', error.toJSON());
      
      // Return user-friendly error
      return { 
        success: false, 
        error: error.getUserFriendlyMessage() 
      };
    }
    throw error; // Re-throw unexpected errors
  }
}
```

### 3. Input Validation

```typescript
function validatePaymentAmount(amount: number): void {
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  if (amount > 1000000) {
    throw new Error('Amount exceeds maximum limit');
  }
}
```

### 4. Webhook Security

```typescript
// Express.js webhook handler example
app.post('/webhooks/payment/success', async (req, res) => {
  const { externalId, amount, currency } = req.body;
  
  try {
    // Always verify payment status from Whish
    const status = await client.getPaymentStatus({ externalId, amount, currency });
    
    if (status.collectStatus === 'success') {
      // Process successful payment
      await updateOrderStatus(externalId, 'paid');
      console.log(`Payment ${externalId} confirmed as successful`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook verification failed:', error);
    res.status(500).send('Error');
  }
});
```

## 🔧 Development Setup

### Prerequisites
- Node.js 16.0.0 or higher
- npm 7.0.0 or higher
- TypeScript knowledge (recommended)

### Installation for Development

```bash
# Clone the repository
git clone https://github.com/samish-dev/whish-module.git
cd whish-module

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## 📚 Documentation

- [API Reference](./docs/API.md) - Complete API documentation
- [Examples](./EXAMPLES.md) - Practical usage examples
- [Migration Guide](./docs/MIGRATION.md) - Upgrading from previous versions
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## 🆕 Changelog

### Version 1.0.3 - Latest

#### ✨ New Features
- Enhanced HTTP client with retry logic and connection pooling
- Comprehensive input validation with field-specific error messages
- Advanced logging system with configurable levels
- Automatic retry logic for transient failures
- Enhanced error analysis with `isRetryable()`, `isClientError()`, `isServerError()`
- Debug logging support for development

#### 🛠️ Improvements
- Better TypeScript support with detailed JSDoc comments
- Enhanced test coverage (>70%)
- Improved error messages with `getUserFriendlyMessage()`
- Code quality improvements with ESLint and Prettier
- CI/CD pipeline with GitHub Actions
- Comprehensive documentation

#### 🔧 Technical Enhancements
- Modern HTTP client with exponential backoff
- Enhanced validation utilities
- Better error serialization with `toJSON()`
- Improved package.json with better metadata
- Development tooling improvements

## 🤝 Contributing

Contributions are welcome! Please read the [contributing guidelines](./CONTRIBUTING.md) and submit pull requests to the GitHub repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:

1. Check the [GitHub Issues](https://github.com/samish-dev/whish-module/issues) page
2. Review the [documentation](./docs/)
3. Contact Whish Money support for API-related questions

## ⚠️ Important Notes

- **Server-side only**: This SDK is for server-side use only. Never expose your API credentials in client-side code.
- **Rate Limits**: The API has built-in rate limiting. The SDK handles this automatically with retry logic.
- **Webhook Verification**: Always verify payment status via the API when receiving webhook notifications.
- **Environment Separation**: Use development environment for testing and production for live transactions.

---

**Built with ❤️ for the developer community**