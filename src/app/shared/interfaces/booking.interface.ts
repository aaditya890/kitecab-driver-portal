export interface Booking {
  id?: string;                      // Firestore doc id
  // ---- ROUTE ----
  bookingCode:string;
  pickup: string;
  drop: string;
  address?: string;
  
  // ---- RIDE TYPE ----
  rideType: 'oneway' | 'roundtrip' | 'localrental';

  // ---- VEHICLE ----
  cabType: 'hatchback' | 'sedan' | 'suv';

  // ---- DATE / TIME ----
  date: string;
  time: string;

  // ---- BASE PRICING (ADMIN DEFINED) ----
  baseDriverIncome: number;         // e.g. 1500
  baseCommission: number;           // e.g. 300

  // ---- INCLUSIONS (rideType based) ----
  inclusions: {
    toll: 'included' | 'excluded';
    parking: 'included' | 'excluded';
    // waiting: 'included' | 'excluded';
  };

  // ---- ASSIGNMENT ----
  status: 'active' | 'inactive' | 'assigned' | 'completed' | 'paid';

    // 🔥 BILL URL PDF
  customerPdfUrl?: string;   

  selectedDriverId?: string;

  // ---- PAYMENT (FUTURE) ----
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  amountPaid?: number;
  paymentMethod?: 'online' | 'upi' | 'cash';

  createdAt: any;


  customerDetails?: {
    name: string
    phone: string
    pickupAddress: string
    dropAddress: string
    date: string
    time: string
    note?: string
    addedAt: Date
    addedBy: 'KITECAB TAXI SERVICE'
    isHidden?:boolean
  }
}
