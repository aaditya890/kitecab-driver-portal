import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  Firestore,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';
import { Bid } from '../interfaces/bid.interface';
import { Booking } from '../interfaces/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private fs = inject(Firestore);

  async createBid(
    booking: Booking,
    driverId: string,
    driverBidIncome: number,
    driverCity: string
  ) {
    // ✅ TOTAL FIXED
    const totalBookingAmount =
      booking.baseDriverIncome + booking.baseCommission;

    // ✅ COMMISSION ADJUSTS
    const finalCommission =
      totalBookingAmount - driverBidIncome;

    const bid = {
      bookingId: booking.id!,
      bookingCode: booking.bookingCode,      // ✅ THIS IS KEY
      driverId,
      driverBidIncome,
      driverCity,

      finalCommission,
      totalBookingAmount,

      status: 'pending',
      timestamp: new Date(),
    };

    const ref = collection(this.fs, 'bids');
    return addDoc(ref, bid);
  }


  // ✅ GET ALL BIDS OF DRIVER
  async getMyBids(driverId: string): Promise<Bid[]> {
    const ref = collection(this.fs, 'bids');
    const q = query(ref, where('driverId', '==', driverId));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Bid)
    }));
  }

  // ✅ USED FOR DISABLE BUTTON LOGIC
  async getMyBidBookingIds(driverId: string): Promise<string[]> {
    const bids = await this.getMyBids(driverId);
    return bids.map(b => b.bookingId);
  }
}
