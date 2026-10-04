import crypto from 'crypto';
import { db } from './db/database';

export interface RazorpayOrderResult {
  orderId: string;
  keyId: string;
  amountPaise: number;
  amountINR: number;
  currency: string;
  isDemo: boolean;
  demoMessage?: string;
}

export async function createPaymentOrder(params: {
  bookingId: string;
  userId: string;
  amountINR: number;
}): Promise<RazorpayOrderResult> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const amountPaise = params.amountINR * 100;

  // Check if live Razorpay credentials are present
  const isLiveConfigured = Boolean(keyId && keySecret && keyId.startsWith('rzp_'));

  if (isLiveConfigured) {
    try {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: params.bookingId,
          notes: {
            booking_id: params.bookingId,
            user_id: params.userId
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.description || 'Razorpay order creation failed');
      }

      const orderData = await response.json();

      // Record in database
      db.createPaymentRecord({
        booking_id: params.bookingId,
        user_id: params.userId,
        amount_inr: params.amountINR,
        razorpay_order_id: orderData.id,
        is_demo: false
      });

      db.updateBookingStatus(params.bookingId, {
        razorpay_order_id: orderData.id,
        payment_status: 'PENDING'
      });

      return {
        orderId: orderData.id,
        keyId: keyId!,
        amountPaise,
        amountINR: params.amountINR,
        currency: 'INR',
        isDemo: false
      };
    } catch (err: any) {
      console.error('Razorpay API error, falling back to Demo Mode notice:', err.message);
      // If the API call fails, fall back to Demo Mode
    }
  }

  // DEMO MODE - Live credentials not configured
  const demoOrderId = `demo_order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  db.createPaymentRecord({
    booking_id: params.bookingId,
    user_id: params.userId,
    amount_inr: params.amountINR,
    razorpay_order_id: demoOrderId,
    is_demo: true
  });

  db.updateBookingStatus(params.bookingId, {
    razorpay_order_id: demoOrderId,
    payment_status: 'DEMO_UNPAID',
    booking_status: 'DEMO_UNCONFIRMED'
  });

  return {
    orderId: demoOrderId,
    keyId: keyId || 'rzp_demo_key_unconfigured',
    amountPaise,
    amountINR: params.amountINR,
    currency: 'INR',
    isDemo: true,
    demoMessage: 'DEMO MODE — LIVE BOOKING UNAVAILABLE. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Settings to accept real payments.'
  };
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature?: string;
  isDemo?: boolean;
}): { verified: boolean; isDemo: boolean; error?: string } {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (params.isDemo || params.orderId.startsWith('demo_order_')) {
    // Under STRICT RULES: Never claim a demo payment is verified or successful.
    // Explicitly record it as unverified demo.
    return {
      verified: false,
      isDemo: true,
      error: 'DEMO MODE: Simulated transactions cannot be marked as verified or paid. Configure valid Razorpay API keys to process real payments.'
    };
  }

  if (!keySecret) {
    return {
      verified: false,
      isDemo: false,
      error: 'Server error: RAZORPAY_KEY_SECRET is not configured on the backend.'
    };
  }

  if (!params.signature) {
    return {
      verified: false,
      isDemo: false,
      error: 'Payment signature missing from verification request.'
    };
  }

  try {
    const payload = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(params.signature, 'utf8')
    );

    if (isValid) {
      db.markPaymentVerified({
        orderId: params.orderId,
        paymentId: params.paymentId,
        signature: params.signature
      });
      return { verified: true, isDemo: false };
    } else {
      db.markPaymentFailed(params.orderId, 'SIG_MISMATCH', 'Razorpay HMAC signature verification failed');
      return { verified: false, isDemo: false, error: 'Payment signature verification failed. Invalid signature.' };
    }
  } catch (err: any) {
    db.markPaymentFailed(params.orderId, 'VERIFY_ERROR', err.message);
    return { verified: false, isDemo: false, error: `Verification error: ${err.message}` };
  }
}
