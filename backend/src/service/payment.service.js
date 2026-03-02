import Razorpay from "razorpay";
import {
  validatePaymentVerification,
  validateWebhookSignature,
} from "razorpay/dist/utils/razorpay-utils.js";

/**
 * Payment Service — Razorpay Wrapper
 *
 * PAYMENT FLOW:
 * 1. Backend creates order -> returns `razorpay_order_id` to frontend.
 * 2. Frontend opens Checkout modal -> User pays -> returns `payment_id` & `signature`.
 * 3. Backend verifies signature via `/verify-payment` (for instant UX).
 * 4. Razorpay sends `payment.captured` Webhook (the absolute SOURCE OF TRUTH).
 *
 * Required ENV: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
 */

let razorpayInstance = null;

/**
 * Lazily initializes the Razorpay SDK instance.
 */
function getRazorpayInstance() {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials in .env file.");
  }

  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
}

/**
 * Step 1: Create a Razorpay Order (Called before user pays).
 * * @param {Object} options
 * @param {Number} options.amount - Amount in RUPEES (converted to paise internally).
 * @param {String} options.receipt - Internal order reference (e.g., orderNumber).
 * @param {Object} options.notes - Arbitrary metadata.
 */
async function createOrder({ amount, currency = "INR", receipt, notes = {} }) {
  if (!amount || amount <= 0) throw new Error("Amount must be positive.");
  if (!receipt) throw new Error("Receipt is required.");

  const razorpay = getRazorpayInstance();

  try {
    return await razorpay.orders.create({
      amount: Math.round(amount * 100), // CRITICAL: Convert rupees to paise
      currency,
      receipt,
      notes,
      payment_capture: 1, // Auto-capture payment on success
    });
  } catch (error) {
    console.error("[PaymentService] createOrder failed:", error);
    throw new Error(
      `Razorpay Error: ${error.error?.description || error.message}`,
    );
  }
}

/**
 * Step 3: Verify the signature returned by the frontend after payment.
 */
function verifySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)
    return false;

  try {
    return validatePaymentVerification(
      { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
      razorpaySignature,
      process.env.RAZORPAY_KEY_SECRET,
    );
  } catch (error) {
    console.error("[PaymentService] Signature verification failed", error);
    return false;
  }
}

/**
 * Webhook Verification: Ensures events from Razorpay are authentic.
 * * @param {String|Buffer} rawBody - IMPORTANT: Must be the RAW request body, NOT parsed JSON.
 * @param {String} signatureHeader - The "X-Razorpay-Signature" header.
 */
function verifyWebhook(rawBody, signatureHeader) {
  if (!rawBody || !signatureHeader) return false;

  try {
    return validateWebhookSignature(
      rawBody.toString(),
      signatureHeader,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("[PaymentService] Webhook verification failed", error);
    return false;
  }
}

/**
 * Fetch payment details directly from Razorpay (Server-side check).
 */
async function fetchPayment(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");
  try {
    return await getRazorpayInstance().payments.fetch(paymentId);
  } catch (error) {
    throw new Error(
      `Fetch payment failed: ${error.error?.description || error.message}`,
    );
  }
}

/**
 * Fetch order details directly from Razorpay.
 */
async function fetchOrder(orderId) {
  if (!orderId) throw new Error("Order ID is required");
  try {
    return await getRazorpayInstance().orders.fetch(orderId);
  } catch (error) {
    throw new Error(
      `Fetch order failed: ${error.error?.description || error.message}`,
    );
  }
}

/**
 * Initiate a refund via Razorpay.
 * * @param {Number} options.amount - Refund amount in RUPEES (omit for full refund).
 */
async function initiateRefund(paymentId, { amount = null, notes = {} } = {}) {
  if (!paymentId) throw new Error("Payment ID is required");

  const refundOptions = { notes };
  if (amount) refundOptions.amount = Math.round(amount * 100);

  try {
    return await getRazorpayInstance().payments.refund(
      paymentId,
      refundOptions,
    );
  } catch (error) {
    throw new Error(
      `Refund failed: ${error.error?.description || error.message}`,
    );
  }
}

const PaymentService = {
  createOrder,
  verifySignature,
  verifyWebhook,
  fetchPayment,
  fetchOrder,
  initiateRefund,
};

export default PaymentService;
