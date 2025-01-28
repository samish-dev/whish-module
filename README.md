# Wish Payment SDK

A TypeScript SDK for interacting with the Wish Payment API.

## Installation
```bash
npm install whish-payment-sdk
```



## Error Handling

The SDK throws a custom `WishPaymentApiError` when an API request fails. This error contains the following properties:

- `message`: A human-readable error message.
- `statusCode`: The HTTP status code of the response.
- `code`: An API-specific error code (if available).
- `details`: Additional error details (if available).

Example:
```js
try {
  const balance = await client.getBalance();
} catch (error) {
  if (error instanceof WishPaymentApiError) {
    console.error("API Error:", error.toJSON());
  } else {
    console.error("Unexpected Error:", error);
  }
}
```
Example Output:
```json
{
  "name": "WishPaymentApiError",
  "message": "Invalid API key",
  "statusCode": 401,
  "code": "UNAUTHORIZED",
  "details": null
}
```