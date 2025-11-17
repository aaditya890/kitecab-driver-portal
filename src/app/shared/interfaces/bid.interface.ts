export interface Bid {
  id?: string;
  bookingId: string;
  driverId: string;
  bidAmount: number;      // Driver quote
  commission: number;     // Admin commission
  netAmount: number;      // bidAmount - commission
  driverCity: string;
  status: 'pending' | 'accepted' | 'closed';
  timestamp: any;
}
