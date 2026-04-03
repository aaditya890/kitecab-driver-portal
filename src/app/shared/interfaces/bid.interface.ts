export interface Bid {
  id?: string;

  bookingId: string;                // Firestore booking doc id
  driverId: string;                 // Driver phone / uid
   bookingCode: string;

  // ---- DRIVER INPUT ----
  driverBidIncome: number;           // 👈 DRIVER ISME BID KAREGA

  // ---- CALCULATED VALUES ----
  finalCommission: number;           // baseCommission ± diff
  totalBookingAmount: number;        // driverBidIncome + finalCommission

  driverCity: string;

  status: 'pending' | 'accepted' | 'closed';
  timestamp: any;

   // 🔥 ADD THIS
  driverPaymentStatus?: 'pending' | 'paid';
  driverPaymentAmount?: number;
  driverPaymentAt?: any;
  razorpayPaymentId?: string;
}
