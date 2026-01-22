import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  runTransaction,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { Booking } from '../interfaces/booking.interface';
import { BidService } from './bid.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private fs = inject(Firestore);
  private bidService = inject(BidService)

  // ✅ DASHBOARD DATA
  async getDashboardData(driverId: string) {
    const [open, mine] = await Promise.all([
      this.getOpenBookings(),
      this.getMyAssignedBookings(driverId),
    ]);

    return { open, mine };
  }

  // ✅ OPEN BOOKINGS (BIDDING)
  async getOpenBookings(): Promise<Booking[]> {
    const ref = collection(this.fs, 'bookings');
    const q = query(ref, where('status', '==', 'active'));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Booking),
    }));
  }

  // ✅ ACCEPTED BOOKINGS OF DRIVER
  async getMyAssignedBookings(driverId: string): Promise<Booking[]> {
    const ref = collection(this.fs, 'bookings');
    const q = query(ref, where('selectedDriverId', '==', driverId));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Booking),
    }));
  }

  async getAllBookings(): Promise<Booking[]> {
    const ref = collection(this.fs, 'bookings');
    const snap = await getDocs(ref);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Booking),
    }));
  }

  deleteBooking(bookingId: string) {
    const ref = doc(this.fs, 'bookings', bookingId);
    return deleteDoc(ref);
  }

  // ✅ SINGLE BOOKING
  async getBookingById(id: string): Promise<Booking | null> {
    const ref = doc(this.fs, 'bookings', id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...(snap.data() as Booking),
    };
  }

  // ✅ START RIDE
  async startRide(bookingId: string) {
    const ref = doc(this.fs, 'bookings', bookingId);
    await updateDoc(ref, { status: 'assigned' });
  }

  // ✅ COMPLETE RIDE
  async completeRide(bookingId: string) {
    const ref = doc(this.fs, 'bookings', bookingId);
    await updateDoc(ref, { status: 'completed' });
  }

  async generateBookingCode(): Promise<string> {
    const counterRef = doc(this.fs, 'counters', 'bookings');

    const bookingCode = await runTransaction(this.fs, async (tx) => {
      const snap = await tx.get(counterRef);

      let last = 0;
      if (snap.exists()) {
        last = snap.data()['last'] || 0;
      }

      const next = last + 1;

      tx.set(counterRef, { last: next }, { merge: true });

      return `#${String(next).padStart(6, '0')}`;
    });

    return bookingCode;
  }


  async createBooking(data: Booking) {
    if (!data.bookingCode) {
      throw new Error('Booking Id is required');
    }

    const booking: Booking = {
      ...data,
      status: 'active',
      createdAt: new Date(),
    };

    const ref = collection(this.fs, 'bookings');
    return addDoc(ref, booking);
  }


  async updateBooking(id: string, data: Partial<Booking>) {
  const ref = doc(this.fs, 'bookings', id);
  return updateDoc(ref, data);
}

  // ✅ ADMIN: ASSIGN DRIVER + UPLOAD CUSTOMER PDF
  async assignDriverWithPdf(
    bookingId: string,
    driverId: string,
    customerPdfUrl: string
  ) {
    const ref = doc(this.fs, 'bookings', bookingId);

    await updateDoc(ref, {
      selectedDriverId: driverId,
      status: 'assigned',
      customerPdfUrl: customerPdfUrl,
    });
  }

  // ✔ ADMIN: get assigned bookings
  async getAssignedBookings(): Promise<Booking[]> {
    const ref = collection(this.fs, 'bookings');
    const q = query(ref, where('status', '==', 'assigned'));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Booking),
    }));
  }


    // 🔥 MASTER DELETE (BOOKING + ALL BIDS)
  async deleteBookingWithBids(bookingId: string) {
    // 1️⃣ delete all bids of this booking
    await this.bidService.deleteBidsByBookingId(bookingId);

    // 2️⃣ delete booking itself
    const ref = doc(this.fs, 'bookings', bookingId);
    await deleteDoc(ref);
  }

}
