import { Currency, PaymentStatus, PaymentProviderType } from '../types';

export interface CreatePaymentPayload {
  orderId: string;
  amount: number;
  currency: Currency;
  method: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  callbackUrl?: string;
  cancelUrl?: string;
  idempotencyKey?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  redirectUrl?: string;
  paymentUrl?: string;
  providerPaymentId?: string;
  transactionId?: string;
  instructions?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentPayload {
  paymentId: string;
  orderId?: string;
  provider?: PaymentProviderType;
  transactionId?: string;
  providerPaymentId?: string;
  payload?: any;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
  error?: string;
}

export interface RefundPayload {
  orderId?: string;
  paymentId?: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundStatus: 'REFUNDED' | 'FAILED';
  refundTransactionId?: string;
  refundAmount?: number;
  message?: string;
  error?: string;
}

export async function createPaymentSession(payload: CreatePaymentPayload): Promise<CreatePaymentResponse> {
  try {
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Payment session creation failed (${res.status})`);
    }

    return await res.json();
  } catch (error: any) {
    console.error('createPaymentSession API error:', error);
    return {
      success: false,
      paymentId: `PAY_ERR_${Date.now()}`,
      status: 'FAILED',
      error: error.message || 'Network error during payment initialization',
    };
  }
}

export async function verifyPaymentSession(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
  try {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Payment verification failed (${res.status})`);
    }

    return await res.json();
  } catch (error: any) {
    console.error('verifyPaymentSession API error:', error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'Payment verification error',
    };
  }
}

export async function getPaymentStatus(orderId: string): Promise<any> {
  try {
    const res = await fetch(`/api/payments/status/${encodeURIComponent(orderId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('getPaymentStatus error:', err);
    return null;
  }
}

export async function refundOrderPayment(payload: RefundPayload): Promise<RefundResponse> {
  try {
    const res = await fetch('/api/payments/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Refund failed (${res.status})`);
    }

    return await res.json();
  } catch (error: any) {
    console.error('refundOrderPayment error:', error);
    return {
      success: false,
      refundStatus: 'FAILED',
      error: error.message || 'Refund processing error',
    };
  }
}
