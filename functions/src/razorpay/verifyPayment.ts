import * as functions from "firebase-functions";
import * as crypto from "crypto";
import * as admin from "firebase-admin";

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bidId: string;
  bookingId: string;
}

export const verifyPayment = functions.https.onCall<VerifyPaymentPayload>(async (request) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bidId,
      bookingId,
    } = request.data;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", "C06bdtSk6f1GzCVuPNcih84O")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid signature");
    }

    const db = admin.firestore();

    // 🔥 BID UPDATE
    await db.collection("bids").doc(bidId).update({
      driverPaymentStatus: "paid",
      driverPaymentAt: new Date(),
      razorpayPaymentId: razorpay_payment_id,
    });

    // 🔥 BOOKING UPDATE
    await db.collection("bookings").doc(bookingId).update({
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
    });

    return { success: true };

  } catch (err) {
    throw new functions.https.HttpsError("internal", "Verification failed");
  }
});