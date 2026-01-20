import { Injectable, inject } from '@angular/core';
import { Driver } from '../interfaces/driver.interface';
import { Firestore, doc, setDoc, getDoc, onSnapshot, collection, orderBy, query, getDocs, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private fs = inject(Firestore);

  async driverExists(phone: string): Promise<boolean> {
    const ref = doc(this.fs, 'drivers', phone);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async getDriver(phone: string): Promise<Driver | null> {
    const ref = doc(this.fs, 'drivers', phone);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as Driver;
  }

  async createDriver(driver: Driver) {
    const ref = doc(this.fs, 'drivers', driver.phone);
    await setDoc(ref, driver);
  }

  async updateCurrentCity(phone: string, city: string) {
    const ref = doc(this.fs, 'drivers', phone);
    await setDoc(ref, { currentCity: city }, { merge: true });
  }

  async updateAvailableRoutes(
    phone: string,
    routes: { from: string; to: string }[]
  ) {
    const ref = doc(this.fs, 'drivers', phone);
    await setDoc(ref, { availableRoutes: routes }, { merge: true });
  }

  async updateOnlineStatus(phone: string, onlineStatus: boolean) {
    const ref = doc(this.fs, 'drivers', phone);
    await updateDoc(ref, { onlineStatus });
  }

  listenToDriver(phone: string, cb: (d: Driver) => void) {
    const ref = doc(this.fs, 'drivers', phone);
    return onSnapshot(ref, snap => {
      if (snap.exists()) {
        cb(snap.data() as Driver);
      }
    });
  }

  // 🔥 CACHE
  private drivers$ = new BehaviorSubject<Driver[] | null>(null);
  private listenerStarted = false;

  // 🔥 REALTIME DRIVERS LIST (NO RELOAD EVER)
  getDrivers(): Observable<Driver[]> {
    return new Observable((observer) => {
      const ref = collection(this.fs, 'drivers');

      const unsub = onSnapshot(ref, (snap) => {
        const drivers: Driver[] = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Driver),
        }));
        observer.next(drivers);
      });

      return () => unsub();
    });
  }

async deleteDriver(phone: string) {
  const ref = doc(this.fs, 'drivers', phone);
  await deleteDoc(ref);
}

async updateDriverStatus(phone: string, status: 'approved' | 'pending' | 'blocked') {
  const ref = doc(this.fs, 'drivers', phone);
  await setDoc(ref, { status }, { merge: true });
}
}
