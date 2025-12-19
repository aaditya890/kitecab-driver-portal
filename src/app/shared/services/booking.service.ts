import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Booking } from '../interfaces/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private fs = inject(Firestore);

    async getDashboardData(driverId: string) {
    const [open, mine] = await Promise.all([
      this.getOpenBookings(),
      this.getMyAssignedBookings(driverId),
    ]);

    return { open, mine };
  }

  // ✅ Dashboard: Sab open bookings (bidding chal rahi hai)
  async getOpenBookings(): Promise<Booking[]> {
    const ref = collection(this.fs, 'bookings');
    const q = query(ref, where('status', '==', 'active'));

    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Booking),
    }));
  }

  // ✅ Dashboard: Sirf wahi booking jis driver ka bid accept hua
  async getMyAssignedBookings(driverId: string): Promise<Booking[]> {
    const ref = collection(this.fs, 'bookings');
    const q = query(ref, where('selectedDriverId', '==', driverId));

    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Booking),
    }));
  }

 async getBookingById(id: string) {
    const ref = doc(this.fs, 'bookings', id);
    const snap = await getDoc(ref);
    return snap.data();
  }

  // ✅ Driver ride start
  async startRide(bookingId: string) {
    const ref = doc(this.fs, 'bookings', bookingId);

    await updateDoc(ref, {
      status: 'active',
    });
  }

  // ✅ Driver ride complete
  async completeRide(bookingId: string) {
    const ref = doc(this.fs, 'bookings', bookingId);

    await updateDoc(ref, {
      status: 'completed',
    });
  }
}
