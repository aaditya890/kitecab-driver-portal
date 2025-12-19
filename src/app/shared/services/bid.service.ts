import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { Bid } from '../interfaces/bid.interface';
@Injectable({
  providedIn: 'root'
})
export class BidService {
 private fs = inject(Firestore);

 async createBid(bid: any) {
    const ref = collection(this.fs, 'bids');
    return addDoc(ref, bid);
  }

  async getMyBids(driverId: string) {
    const ref = collection(this.fs, 'bids');
    const q = query(ref, where('driverId', '==', driverId));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Bid[];
  }

  async getMyBidBookingIds(driverId: string): Promise<string[]> {
  const bids = await this.getMyBids(driverId);
  return bids.map(b => b.bookingId);
}

}
