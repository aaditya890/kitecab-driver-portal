import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Bid } from '../interfaces/bid.interface';
import { Booking } from '../interfaces/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private fs = inject(Firestore);

  /* =====================================================
     CREATE OR UPDATE BID  (🔥 MAIN FIX)
     Rule: 1 booking + 1 driver = ONLY ONE BID
  ===================================================== */
  async createOrUpdateBid(
    booking: Booking,
    driverId: string,
    driverBidIncome: number,
    driverCity: string
  ) {
    // ✅ TOTAL (ADMIN FIXED)
    const totalBookingAmount =
      booking.baseDriverIncome + booking.baseCommission;

    // ✅ COMMISSION (never negative)
    const finalCommission = Math.max(
      0,
      totalBookingAmount - driverBidIncome
    );

    const ref = collection(this.fs, 'bids');

    // 🔍 Check if bid already exists
    const q = query(
      ref,
      where('bookingId', '==', booking.id),
      where('driverId', '==', driverId)
    );

    const snap = await getDocs(q);

    // 🟢 CASE 1: EXISTING BID → UPDATE
    if (!snap.empty) {
      const existingDoc = snap.docs[0];

      await updateDoc(doc(this.fs, 'bids', existingDoc.id), {
        driverBidIncome,
        finalCommission,
        totalBookingAmount,
        driverCity,
        status: 'pending',       // edit keeps bid pending
        timestamp: new Date(),
      });

      return existingDoc.id;
    }

    // 🟢 CASE 2: FIRST BID → CREATE
    const bid: Omit<Bid, 'id'> = {
      bookingId: booking.id!,
      bookingCode: booking.bookingCode,
      driverId,
      driverBidIncome,
      driverCity,
      finalCommission,
      totalBookingAmount,
      status: 'pending',
      timestamp: new Date(),
    };

    const docRef = await addDoc(ref, bid);
    return docRef.id;
  }

  /* =====================================================
     GET ALL BIDS OF DRIVER
  ===================================================== */
  async getMyBids(driverId: string): Promise<Bid[]> {
    const ref = collection(this.fs, 'bids');
    const q = query(ref, where('driverId', '==', driverId));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Bid),
    }));
  }

  /* =====================================================
     USED FOR DISABLE "VIEW & ACCEPT" BUTTON
  ===================================================== */
  async getMyBidBookingIds(driverId: string): Promise<string[]> {
    const bids = await this.getMyBids(driverId);
    return bids.map(b => b.bookingId);
  }

  /* =====================================================
     DELETE BID (ONLY PENDING)
  ===================================================== */
  async deleteBid(bidId: string) {
    const ref = doc(this.fs, 'bids', bidId);
    return deleteDoc(ref);
  }


// ✔ get bids by booking
async getBidsByBookingId(bookingId: string) {
  const ref = collection(this.fs, 'bids');
  const q = query(ref, where('bookingId', '==', bookingId));
  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    id: d.id,
    ...(d.data() as Bid),
  }));
}

// ✔ mark one bid accepted
async markBidAccepted(bidId: string) {
  const ref = doc(this.fs, 'bids', bidId);
  await updateDoc(ref, { status: 'accepted' });
}

// ✔ close all other bids of same booking
async closeOtherBidsOfBooking(bookingId: string, acceptedBidId: string) {
  const ref = collection(this.fs, 'bids');
  const q = query(
    ref,
    where('bookingId', '==', bookingId),
    where('status', '==', 'pending')
  );

  const snap = await getDocs(q);

  for (const d of snap.docs) {
    if (d.id !== acceptedBidId) {
      await updateDoc(doc(this.fs, 'bids', d.id), {
        status: 'closed',
      });
    }
  }

}}
