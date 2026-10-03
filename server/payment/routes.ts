import { Router, Request, Response } from 'express';
import { PaymentService } from './PaymentService';

export const paymentRouter = Router();
const paymentService = PaymentService.getInstance();

// 1. Create Payment Session
paymentRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      amount,
      currency = 'BDT',
      method = 'Cash on Delivery',
      customerName,
      customerPhone,
      customerEmail,
      callbackUrl,
      cancelUrl,
      idempotencyKey,
    } = req.body;

    if (!orderId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid orderId and numeric amount are required' });
    }

    const provider = paymentService.mapMethodToProvider(method);

    const result = await paymentService.createPayment({
      orderId,
      amount,
      currency,
      method,
      provider,
      customerName: customerName || 'Customer',
      customerPhone: customerPhone || '',
      customerEmail,
      callbackUrl,
      cancelUrl,
      idempotencyKey,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return res.status(500).json({
      error: 'Failed to create payment session',
      details: error.message || 'Internal server error',
    });
  }
});

// 2. Verify Payment
paymentRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const { paymentId, orderId, provider, transactionId, providerPaymentId, payload } = req.body;

    if (!paymentId && !orderId) {
      return res.status(400).json({ error: 'paymentId or orderId is required' });
    }

    const resolvedProvider = provider || (orderId ? paymentService.mapMethodToProvider('bkash') : 'bkash');

    const result = await paymentService.verifyPayment({
      paymentId: paymentId || '',
      orderId,
      provider: resolvedProvider,
      transactionId,
      providerPaymentId,
      payload,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      error: 'Failed to verify payment',
      details: error.message || 'Internal server error',
    });
  }
});

// 3. Query Payment Status by Order ID
paymentRouter.get('/status/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;
  const transaction = paymentService.getTransactionByOrderId(orderId);

  if (!transaction) {
    return res.status(404).json({ error: 'No payment transaction found for this order' });
  }

  return res.json({
    orderId: transaction.orderId,
    paymentId: transaction.id,
    provider: transaction.provider,
    method: transaction.method,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    transactionId: transaction.transactionId,
    paidAt: transaction.paidAt,
    refundStatus: transaction.refundStatus,
    refundAmount: transaction.refundAmount,
  });
});

// 4. bKash Callback Handlers (POST & GET)
paymentRouter.all('/bkash/callback', async (req: Request, res: Response) => {
  try {
    const paymentID = req.query.paymentID || req.body.paymentID;
    const status = req.query.status || req.body.status;

    if (status === 'cancel' || status === 'failure') {
      return res.redirect(`/?payment_status=cancelled&paymentID=${paymentID || ''}`);
    }

    if (status === 'success' && paymentID) {
      const verifyResult = await paymentService.verifyPayment({
        paymentId: paymentID.toString(),
        provider: 'bkash',
        providerPaymentId: paymentID.toString(),
      });

      if (verifyResult.success) {
        return res.redirect(`/?payment_status=success&trxId=${verifyResult.transactionId || ''}&paymentID=${paymentID}`);
      }
    }

    return res.redirect(`/?payment_status=failed&paymentID=${paymentID || ''}`);
  } catch (err: any) {
    console.error('bKash callback error:', err);
    return res.redirect('/?payment_status=error');
  }
});

// 5. Nagad Callback Handlers (POST & GET)
paymentRouter.all('/nagad/callback', async (req: Request, res: Response) => {
  try {
    const paymentRefId = req.query.payment_ref_id || req.body.payment_ref_id;
    const status = req.query.status || req.body.status;

    if (status === 'Aborted' || status === 'Failed') {
      return res.redirect(`/?payment_status=cancelled&paymentRef=${paymentRefId || ''}`);
    }

    if (paymentRefId) {
      const verifyResult = await paymentService.verifyPayment({
        paymentId: paymentRefId.toString(),
        provider: 'nagad',
        providerPaymentId: paymentRefId.toString(),
      });

      if (verifyResult.success) {
        return res.redirect(`/?payment_status=success&trxId=${verifyResult.transactionId || ''}&paymentRef=${paymentRefId}`);
      }
    }

    return res.redirect(`/?payment_status=failed&paymentRef=${paymentRefId || ''}`);
  } catch (err: any) {
    console.error('Nagad callback error:', err);
    return res.redirect('/?payment_status=error');
  }
});

// 6. Card Callback & IPN Webhook Handlers
paymentRouter.all('/card/callback', async (req: Request, res: Response) => {
  try {
    const val_id = req.query.val_id || req.body.val_id;
    const tran_id = req.query.tran_id || req.body.tran_id;
    const status = req.query.status || req.body.status;

    if (status === 'CANCELLED' || status === 'FAILED') {
      return res.redirect(`/?payment_status=cancelled&tranId=${tran_id || ''}`);
    }

    if (val_id || tran_id) {
      const verifyResult = await paymentService.verifyPayment({
        paymentId: tran_id ? tran_id.toString() : '',
        provider: 'card',
        payload: { val_id, tran_id },
      });

      if (verifyResult.success) {
        return res.redirect(`/?payment_status=success&trxId=${verifyResult.transactionId || ''}&tranId=${tran_id}`);
      }
    }

    return res.redirect(`/?payment_status=failed&tranId=${tran_id || ''}`);
  } catch (err: any) {
    console.error('Card callback error:', err);
    return res.redirect('/?payment_status=error');
  }
});

paymentRouter.post('/card/webhook', async (req: Request, res: Response) => {
  try {
    const { val_id, tran_id, status } = req.body;
    if (val_id && status === 'VALID') {
      await paymentService.verifyPayment({
        paymentId: tran_id || '',
        provider: 'card',
        payload: req.body,
      });
    }
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Card IPN error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 7. Refund API (Admin)
paymentRouter.post('/refund', async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, amount, reason } = req.body;
    if (!orderId && !paymentId) {
      return res.status(400).json({ error: 'orderId or paymentId is required' });
    }

    const result = await paymentService.refundPayment({
      orderId: orderId || '',
      paymentId: paymentId || '',
      amount: typeof amount === 'number' ? amount : undefined,
      reason,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return res.status(500).json({
      error: 'Failed to process refund',
      details: error.message || 'Internal server error',
    });
  }
});

// 8. List Payment Transactions (Admin)
paymentRouter.get('/transactions', (_req: Request, res: Response) => {
  const list = paymentService.getAllTransactions();
  return res.json({
    transactions: list,
    count: list.length,
  });
});
