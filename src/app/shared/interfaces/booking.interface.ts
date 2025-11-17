export interface Booking {
  id?: string;
  pickup: string;             
  drop: string;                 
  address?: string;             
  cabType: 'hatchback' | 'sedan' | 'suv';
  date: string;
  time: string;
  status: 'active' | 'inactive' | 'assigned' | 'completed' | 'paid';
  adminPrice?: number;
  commissionAmount: number;    
  selectedDriverId?: string;
  // ---- PAYMENT FUTURE SUPPORT ----
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  amountPaid?: number;
  paymentMethod?: 'online' | 'upi' | 'cash';
  createdAt: any;
}
