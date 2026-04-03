import * as functions from "firebase-functions";
import { razorpay } from "../utils/razorpayClient";

export const createOrder = functions.https.onCall(async (data) => {
  try {
    const { amount, bidId } = data.data;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `bid_${bidId}`,
    });

    return {
      orderId: order.id,
      amount: order.amount,
    };

  } catch (err) {
    throw new functions.https.HttpsError("internal", "Order failed");
  }
});