import { Injectable } from '@angular/core';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { firebaseDb } from '../../firebase.config';
import { Driver } from '../interfaces/driver.interface';
import { User as FirebaseUser } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  private collectionName = 'drivers';

  // =======================================================
  // 🔍 GET EXISTING DRIVER BY UID
  // =======================================================
  async getDriverById(uid: string): Promise<Driver | null> {
    const ref = doc(firebaseDb, this.collectionName, uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Driver;
  }

  // =======================================================
  // 🆕 CREATE DRIVER RECORD ON FIRST LOGIN
  // =======================================================
  async createDefaultDriver(fbUser: FirebaseUser): Promise<Driver> {
    const uid = fbUser.uid;
    const phone = fbUser.phoneNumber || '';

    const newDriver: Driver = {
      id: uid,
      name: '',
      phone,
      address: '',
      city: '',
      cabType: 'hatchback',
      vehicleNumber: '',
      vehicleModel: '',
      idProofUrl: '',
      idProofType: '',
      currentCity: '',
      onlineStatus: false,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const ref = doc(firebaseDb, this.collectionName, uid);
    await setDoc(ref, newDriver);

    return newDriver;
  }

  // =======================================================
  // 🧠 ENSURE DRIVER EXISTS (Used during OTP login)
  // =======================================================
  async ensureDriverOnLogin(fbUser: FirebaseUser): Promise<Driver> {
    const existing = await this.getDriverById(fbUser.uid);

    if (existing) {
      return existing;
    }

    return await this.createDefaultDriver(fbUser);
  }

  // =======================================================
  // ✏ UPDATE DRIVER PROFILE
  // =======================================================
  async updateDriverProfile(uid: string, data: Partial<Driver>): Promise<void> {
    const ref = doc(firebaseDb, this.collectionName, uid);
    await updateDoc(ref, data as any);
  }

  // =======================================================
  // 🟢 Set Online/Offline
  // =======================================================
  async setOnlineStatus(uid: string, status: boolean): Promise<void> {
    const ref = doc(firebaseDb, this.collectionName, uid);
    await updateDoc(ref, { onlineStatus: status });
  }

  // =======================================================
  // 🟢 Update Driver City (Set current location)
  // =======================================================
  async updateCurrentCity(uid: string, city: string): Promise<void> {
    const ref = doc(firebaseDb, this.collectionName, uid);
    await updateDoc(ref, { currentCity: city });
  }
}
