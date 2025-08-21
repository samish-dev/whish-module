# Examples

This directory contains practical examples of how to use the Whish Payment SDK in different scenarios.

## Basic Usage Examples

### 1. Simple Payment Flow
```typescript
import WhishPaymentClient, { WhishPaymentApiError } from 'whish-payment';

const client = new WhishPaymentClient({
  env: 'development',
  channel: process.env.WHISH_CHANNEL!,
  secret: process.env.WHISH_SECRET!,
  websiteUrl: 'https://mystore.com'
});

async function createPayment() {
  try {
    const payment = await client.getPaymentLink({
      amount: 99.99,
      currency: 'USD',
      invoice: 'Order #12345',
      externalId: Date.now(),
      successCallbackUrl: 'https://mystore.com/api/payment/success',
      failureCallbackUrl: 'https://mystore.com/api/payment/failure',
      successRedirectUrl: 'https://mystore.com/thank-you',
      failureRedirectUrl: 'https://mystore.com/payment-failed'
    });
    
    console.log('Payment URL:', payment.collectUrl);
    return payment.collectUrl;
  } catch (error) {
    if (error instanceof WhishPaymentApiError) {
      console.error('Payment creation failed:', error.getUserFriendlyMessage());
    }
    throw error;
  }
}
```

### 2. Check Account Balance
```typescript
async function checkBalance() {
  try {
    const balance = await client.getBalance();
    console.log(`Current balance: $${balance.balance}`);
    
    if (balance.balance < 100) {
      console.warn('Low balance warning!');
    }
    
    return balance.balance;
  } catch (error) {
    if (error instanceof WhishPaymentApiError) {
      console.error('Failed to get balance:', error.message);
    }
    throw error;
  }
}
```

### 3. Monitor Payment Status
```typescript
async function checkPaymentStatus(externalId: number, amount: number, currency: 'USD' | 'LBP' | 'AED') {
  try {
    const status = await client.getPaymentStatus({
      externalId,
      amount,
      currency
    });
    
    console.log(`Payment ${externalId} status: ${status.collectStatus}`);
    return status.collectStatus;
  } catch (error) {
    if (error instanceof WhishPaymentApiError) {
      console.error('Status check failed:', error.message);
    }
    throw error;
  }
}
```

## Integration Examples

### Express.js Integration
```typescript
import express from 'express';
import WhishPaymentClient from 'whish-payment';

const app = express();
const whishClient = new WhishPaymentClient({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  channel: process.env.WHISH_CHANNEL!,
  secret: process.env.WHISH_SECRET!,
  websiteUrl: process.env.WEBSITE_URL!
});

app.use(express.json());

// Create payment endpoint
app.post('/api/payments', async (req, res) => {
  try {
    const { amount, currency, orderId } = req.body;
    
    const payment = await whishClient.getPaymentLink({
      amount,
      currency,
      invoice: `Order ${orderId}`,
      externalId: orderId,
      successCallbackUrl: `${process.env.WEBSITE_URL}/api/webhooks/payment/success`,
      failureCallbackUrl: `${process.env.WEBSITE_URL}/api/webhooks/payment/failure`,
      successRedirectUrl: `${process.env.WEBSITE_URL}/order/${orderId}/success`,
      failureRedirectUrl: `${process.env.WEBSITE_URL}/order/${orderId}/failed`
    });
    
    res.json({ paymentUrl: payment.collectUrl });
  } catch (error) {
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// Webhook handlers
app.post('/api/webhooks/payment/success', async (req, res) => {
  const { externalId, amount, currency } = req.body;
  
  try {
    // Verify payment status
    const status = await whishClient.getPaymentStatus({
      externalId,
      amount,
      currency
    });
    
    if (status.collectStatus === 'success') {
      // Process successful payment
      await updateOrderStatus(externalId, 'paid');
      console.log(`Payment ${externalId} confirmed as successful`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).send('Error');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Error Handling with Retry Logic
```typescript
async function createPaymentWithRetry(paymentData: any, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const payment = await client.getPaymentLink(paymentData);
      return payment;
    } catch (error) {
      if (error instanceof WhishPaymentApiError) {
        if (error.isRetryable() && attempt < maxRetries - 1) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retrying payment creation in ${delay}ms (attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      throw error;
    }
  }
}
```

### TypeScript Type Guards
```typescript
import { Status, Currency } from 'whish-payment';

function isValidCurrency(currency: string): currency is Currency {
  return ['USD', 'LBP', 'AED'].includes(currency);
}

function isSuccessfulPayment(status: Status): boolean {
  return status === 'success';
}

// Usage
const userCurrency = 'USD';
if (isValidCurrency(userCurrency)) {
  // TypeScript now knows userCurrency is Currency type
  const payment = await client.getPaymentLink({
    // ... other props
    currency: userCurrency
  });
}
```

## Environment Configuration

### .env Example
```env
# Whish Payment Configuration
WHISH_CHANNEL=your-channel-id
WHISH_SECRET=your-secret-key
WEBSITE_URL=https://yourwebsite.com

# Environment
NODE_ENV=development
```

### Config Module
```typescript
// config/whish.ts
import { WhishClientConfig } from 'whish-payment';

export const whishConfig: WhishClientConfig = {
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  channel: process.env.WHISH_CHANNEL!,
  secret: process.env.WHISH_SECRET!,
  websiteUrl: process.env.WEBSITE_URL!,
  timeout: 30000, // 30 seconds
};

// Validate required environment variables
const requiredEnvVars = ['WHISH_CHANNEL', 'WHISH_SECRET', 'WEBSITE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## Testing Examples

### Mock Client for Testing
```typescript
// tests/mocks/whish-client.mock.ts
import { WhishPaymentClient } from 'whish-payment';

export class MockWhishClient {
  async getBalance() {
    return { balance: 1000 };
  }
  
  async getPaymentLink(props: any) {
    return { collectUrl: `https://mock-payment.com/${props.externalId}` };
  }
  
  async getPaymentStatus(props: any) {
    return { collectStatus: 'success' as const };
  }
}
```

### Unit Test Example
```typescript
// tests/payment.test.ts
import { MockWhishClient } from './mocks/whish-client.mock';

describe('Payment Service', () => {
  let mockClient: MockWhishClient;
  
  beforeEach(() => {
    mockClient = new MockWhishClient();
  });
  
  it('should create payment link', async () => {
    const result = await mockClient.getPaymentLink({
      amount: 100,
      currency: 'USD',
      externalId: 12345
    });
    
    expect(result.collectUrl).toContain('12345');
  });
});
```
