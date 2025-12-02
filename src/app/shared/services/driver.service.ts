import { Injectable, inject } from '@angular/core';
import { Driver } from '../interfaces/driver.interface';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private fs = inject(Firestore);

  async driverExists(phone: string): Promise<boolean> {
    const ref = doc(this.fs, "drivers", phone);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async getDriver(phone: string) {
    const ref = doc(this.fs, "drivers", phone);
    const snap = await getDoc(ref);
    return snap.data() as Driver;
  }

  async createDriver(driver: Driver) {
    const ref = doc(this.fs, "drivers", driver.phone);
    await setDoc(ref, driver);
  }
}