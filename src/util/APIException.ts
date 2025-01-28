export class WishPaymentApiError extends Error {
    public readonly statusCode: number;
    public readonly code: string | null;
    public readonly details: unknown;
  
    constructor(
      message: string,
      statusCode: number,
      code: string | null = null,
      details: unknown = null
    ) {
      super(message);
      this.name = "WishPaymentApiError";
      this.statusCode = statusCode; 
      this.code = code; 
      this.details = details; 
  
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, WishPaymentApiError);
      }
    }
  
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        code: this.code,
        details: this.details,
      };
    }
  }