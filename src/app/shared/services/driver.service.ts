import { Injectable, inject } from '@angular/core';
import { Driver } from '../interfaces/driver.interface';
import { Firestore, doc, setDoc, getDoc, onSnapshot } from '@angular/fire/firestore';

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

  async updateOnlineStatus(phone: string, status: boolean) {
    const ref = doc(this.fs, 'drivers', phone);
    await setDoc(ref, { onlineStatus: status }, { merge: true });
  }

  listenToDriver(phone: string, cb: (d: Driver) => void) {
    const ref = doc(this.fs, 'drivers', phone);
    return onSnapshot(ref, snap => {
      if (snap.exists()) {
        cb(snap.data() as Driver);
      }
    });
  }
}
