import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
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

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private fs = inject(Firestore);

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

    return `BK-${String(next).padStart(6, '0')}`;
  });

  return bookingCode;
}


async createBooking(data: Booking) {
  const bookingCode = await this.generateBookingCode();

  const booking: Booking = {
    ...data,
    bookingCode,
    status: 'active',
    createdAt: new Date(),
  };

  const ref = collection(this.fs, 'bookings');
  return addDoc(ref, booking);
}
}
