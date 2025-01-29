# Whish Payment 
 
 The Whish Payment Node library provides convenient access to the Whish Money API from applications written in server-side JavaScript.

## Installation
Install the package with:
```bash
npm install whish-payment
```

## Usage

The package needs to be configured with your account's secret key channel key and websiteUrl, which is sent by email by the Whish money team, (you can apply for these keys by contacting the Whish Money support)

Example usage of the available APIs:
```js
import WhishPaymentClient from 'whish-payment'

const whishClient = new WhishPaymentClient({env: 'development', channel: 'ss', secret: 'ss', websiteUrl: 'abc'});

const {balance}: BalanceDetails = await whishClient.getBalance();

const whishPaymentRequest: PaymentProps = {
    amount: 100,
    currency: 'USD',
    invoice: `Invoice number 123`,
    externalId: 123456789,
    successCallbackUrl: '/callback/payment/success',
    failureCallbackUrl: '/callback/payment/failure',
    successRedirectUrl: '/client/redirect/success',
    failureRedirectUrl: '/client/redirect/failure'
};

const payment: PaymentDetails = await whishClient.getPaymentLink(whishPaymentRequest);

const whishPaymentStatusRequest: CollectStatusProps = {
    amount: 100,
    currency: 'USD',
    externalId: 123456789
}
const status: CollectStatusDetails = await whishClient.getPaymentStatus(whishPaymentStatusRequest);

console.log('Your balance is ', balance)
console.log('Payment link to be shared with client: ', payment.collectUrl)
console.log('To check the payment status: ', status.collectStatus)
```

## Testing

In dev mode:
Success payment:
  phone number: 96170902894
  OTP: 111111
Failure payment:
  phone number: any
  OTP: 111111

## Error Handling

The SDK throws a custom `WhishPaymentApiError` when an API request fails. This error contains the following properties:

- `message`: A human-readable error message.
- `statusCode`: The HTTP status code of the response.
- `code`: An API-specific error code (if available).
- `details`: Additional error details (if available).

Example:
```js
try {
  const balance = await client.getBalance();
} catch (error) {
  if (error instanceof WhishPaymentApiError) {
    console.error("API Error:", error.toJSON());
  } else {
    console.error("Unexpected Error:", error);
  }
}
```
Example Output:
```json
{
  "name": "WhishPaymentApiError",
  "message": "Invalid API key",
  "statusCode": 401,
  "code": "UNAUTHORIZED",
  "details": null
}
```