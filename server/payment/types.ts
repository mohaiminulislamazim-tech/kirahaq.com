export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentProviderType = 'bkash' | 'nagad' | 'card' | 'cod' | 'manual';

export interface PaymentTransactionRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProviderType;
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  providerPaymentId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  errorMessage?: string;
  refundStatus?: 'NONE' | 'REQUESTED' | 'REFUNDED' | 'FAILED';
  refundAmount?: number;
  refundTransactionId?: string;
  refundReason?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface CreatePaymentOptions {
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  provider: PaymentProviderType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  callbackUrl?: string;
  cancelUrl?: string;
  idempotencyKey?: string;
}

export interface CreatePaymentResult {
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

export interface VerifyPaymentOptions {
  paymentId: string;
  orderId?: string;
  provider: PaymentProviderType;
  transactionId?: string;
  providerPaymentId?: string;
  payload?: any;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
  error?: string;
  rawResponse?: any;
}

export interface RefundOptions {
  paymentId: string;
  orderId: string;
  amount?: number;
  reason?: string;
  trxId?: string;
}

export interface RefundResult {
  success: boolean;
  refundStatus: 'REFUNDED' | 'FAILED';
  refundTransactionId?: string;
  refundAmount?: number;
  message?: string;
  error?: string;
}

export interface PaymentProviderInterface {
  name: PaymentProviderType;
  createPayment(options: CreatePaymentOptions): Promise<CreatePaymentResult>;
  verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult>;
  refundPayment(options: RefundOptions): Promise<RefundResult>;
  queryPayment?(paymentId: string): Promise<VerifyPaymentResult>;
}
