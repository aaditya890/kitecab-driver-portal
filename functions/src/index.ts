import * as admin from "firebase-admin";

admin.initializeApp();

export { createOrder } from "./razorpay/createOrder";
export { verifyPayment } from "./razorpay/verifyPayment";