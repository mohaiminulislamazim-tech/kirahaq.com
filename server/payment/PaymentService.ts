import {
  PaymentProviderInterface,
  PaymentProviderType,
  PaymentTransactionRecord,
  CreatePaymentOptions,
  CreatePaymentResult,
  VerifyPaymentOptions,
  VerifyPaymentResult,
  RefundOptions,
  RefundResult,
} from './types';
import { BkashProvider } from './providers/BkashProvider';
import { NagadProvider } from './providers/NagadProvider';
import { CardProvider } from './providers/CardProvider';

export class PaymentService {
  private static instance: PaymentService;
  private providers: Map<PaymentProviderType, PaymentProviderInterface> = new Map();
  private transactions: Map<string, PaymentTransactionRecord> = new Map();
  private orderToPaymentMap: Map<string, string> = new Map();
  private idempotencyLock: Set<string> = new Set();

  private constructor() {
    this.registerProvider(new BkashProvider());
    this.registerProvider(new NagadProvider());
    this.registerProvider(new CardProvider());
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public registerProvider(provider: PaymentProviderInterface) {
    this.providers.set(provider.name, provider);
  }

  public getProvider(name: PaymentProviderType): PaymentProviderInterface | undefined {
    return this.providers.get(name);
  }

  public mapMethodToProvider(method: string): PaymentProviderType {
    const m = (method || '').toLowerCase();
    if (m.includes('bkash')) return 'bkash';
    if (m.includes('nagad')) return 'nagad';
    if (m.includes('visa') || m.includes('master') || m.includes('card') || m.includes('amex') || m.includes('american')) {
      return 'card';
    }
    if (m.includes('cash') || m.includes('cod')) return 'cod';
    return 'manual';
  }

  public async createPayment(options: CreatePaymentOptions): Promise<CreatePaymentResult> {
    const lockKey = `create_${options.orderId}_${options.idempotencyKey || ''}`;
    if (this.idempotencyLock.has(lockKey)) {
      const existingPaymentId = this.orderToPaymentMap.get(options.orderId);
      if (existingPaymentId && this.transactions.has(existingPaymentId)) {
        const tx = this.transactions.get(existingPaymentId)!;
        return {
          success: true,
          paymentId: tx.id,
          status: tx.status,
          transactionId: tx.transactionId,
          providerPaymentId: tx.providerPaymentId,
        };
      }
    }

    this.idempotencyLock.add(lockKey);

    try {
      const provider = this.getProvider(options.provider);
      if (!provider) {
        // Fallback for COD or manual
        const paymentId = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const record: PaymentTransactionRecord = {
          id: paymentId,
          orderId: options.orderId,
          amount: options.amount,
          currency: options.currency,
          provider: options.provider,
          method: options.method,
          status: 'PENDING',
          customerName: options.customerName,
          customerPhone: options.customerPhone,
          customerEmail: options.customerEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.transactions.set(paymentId, record);
        this.orderToPaymentMap.set(options.orderId, paymentId);

        return {
          success: true,
          paymentId,
          status: 'PENDING',
        };
      }

      const result = await provider.createPayment(options);

      const record: PaymentTransactionRecord = {
        id: result.paymentId,
        orderId: options.orderId,
        amount: options.amount,
        currency: options.currency,
        provider: options.provider,
        method: options.method,
        status: result.status,
        providerPaymentId: result.providerPaymentId,
        transactionId: result.transactionId,
        customerName: options.customerName,
        customerPhone: options.customerPhone,
        customerEmail: options.customerEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: result.metadata,
        idempotencyKey: options.idempotencyKey,
      };

      this.transactions.set(result.paymentId, record);
      this.orderToPaymentMap.set(options.orderId, result.paymentId);

      return result;
    } finally {
      setTimeout(() => this.idempotencyLock.delete(lockKey), 5000);
    }
  }

  public async verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult> {
    const tx = this.transactions.get(options.paymentId) || 
      (options.orderId ? this.getTransactionByOrderId(options.orderId) : undefined);

    if (tx && tx.status === 'SUCCESS') {
      return {
        success: true,
        status: 'SUCCESS',
        transactionId: tx.transactionId,
        providerPaymentId: tx.providerPaymentId,
        amount: tx.amount,
        currency: tx.currency,
        paidAt: tx.paidAt,
      };
    }

    const providerType = options.provider || tx?.provider || 'manual';
    const provider = this.getProvider(providerType);

    let verifyResult: VerifyPaymentResult;
    if (provider) {
      verifyResult = await provider.verifyPayment({
        ...options,
        providerPaymentId: options.providerPaymentId || tx?.providerPaymentId,
        transactionId: options.transactionId || tx?.transactionId,
      });
    } else {
      verifyResult = {
        success: true,
        status: 'SUCCESS',
        transactionId: options.transactionId || `TRX-${Date.now()}`,
        paidAt: new Date().toISOString(),
      };
    }

    if (tx) {
      tx.status = verifyResult.status;
      tx.updatedAt = new Date().toISOString();
      if (verifyResult.success && verifyResult.status === 'SUCCESS') {
        tx.transactionId = verifyResult.transactionId || tx.transactionId;
        tx.providerPaymentId = verifyResult.providerPaymentId || tx.providerPaymentId;
        tx.paidAt = verifyResult.paidAt || new Date().toISOString();
      } else if (!verifyResult.success) {
        tx.errorMessage = verifyResult.error;
      }
      this.transactions.set(tx.id, tx);
    }

    return verifyResult;
  }

  public async refundPayment(options: RefundOptions): Promise<RefundResult> {
    const tx = this.transactions.get(options.paymentId) || 
      (options.orderId ? this.getTransactionByOrderId(options.orderId) : undefined);

    const providerType = tx?.provider || 'manual';
    const provider = this.getProvider(providerType);

    let result: RefundResult;
    if (provider) {
      result = await provider.refundPayment({
        ...options,
        trxId: options.trxId || tx?.transactionId,
        amount: options.amount || tx?.amount,
      });
    } else {
      result = {
        success: true,
        refundStatus: 'REFUNDED',
        refundTransactionId: `REF-${Date.now()}`,
        refundAmount: options.amount || tx?.amount,
        message: 'Refund recorded successfully',
      };
    }

    if (tx && result.success) {
      tx.refundStatus = 'REFUNDED';
      tx.refundAmount = result.refundAmount || options.amount || tx.amount;
      tx.refundTransactionId = result.refundTransactionId;
      tx.refundReason = options.reason;
      tx.status = 'REFUNDED';
      tx.updatedAt = new Date().toISOString();
      this.transactions.set(tx.id, tx);
    }

    return result;
  }

  public getTransaction(paymentId: string): PaymentTransactionRecord | undefined {
    return this.transactions.get(paymentId);
  }

  public getTransactionByOrderId(orderId: string): PaymentTransactionRecord | undefined {
    const paymentId = this.orderToPaymentMap.get(orderId);
    if (paymentId) return this.transactions.get(paymentId);

    for (const tx of this.transactions.values()) {
      if (tx.orderId === orderId) return tx;
    }
    return undefined;
  }

  public getAllTransactions(): PaymentTransactionRecord[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
